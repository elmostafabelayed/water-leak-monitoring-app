<?php

namespace App\Http\Controllers\Api;

use App\Models\LeakEvent;
use App\Models\WaterReading;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends BaseApiController
{
    public function weekly(Request $request)
    {
        $userId = $request->user()->id;
        $since = Carbon::now()->subDays(7);

        $rows = WaterReading::where('user_id', $userId)
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as day, SUM(flow_rate) as consumption')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('day')
            ->get();

        return $this->success(['data' => $rows]);
    }

    public function monthly(Request $request)
    {
        $userId = $request->user()->id;
        $since = Carbon::now()->subDays(30);

        $rows = WaterReading::where('user_id', $userId)
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as date, SUM(flow_rate) as consumption')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return $this->success(['data' => $rows]);
    }

    public function saved(Request $request)
    {
        $userId = $request->user()->id;

        $totalSaved = (float) LeakEvent::where('user_id', $userId)
            ->where('auto_closed', true)
            ->sum(DB::raw('flow_rate_detected * 2'));

        return $this->success(['total_saved_liters' => $totalSaved]);
    }

    public function peakHours(Request $request)
    {
        $userId = $request->user()->id;
        $since = Carbon::now()->subHours(24);

        $rows = WaterReading::where('user_id', $userId)
            ->where('created_at', '>=', $since)
            ->selectRaw('HOUR(created_at) as hour, AVG(flow_rate) as avg_flow')
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderBy('hour')
            ->get();

        return $this->success(['data' => $rows]);
    }

    public function comparison(Request $request)
    {
        $userId = $request->user()->id;

        $thisSince = Carbon::now()->subDays(7);
        $lastStart = Carbon::now()->subDays(14);
        $lastEnd = Carbon::now()->subDays(7);

        $thisWeek = (float) WaterReading::where('user_id', $userId)
            ->where('created_at', '>=', $thisSince)
            ->sum('flow_rate');

        $lastWeek = (float) WaterReading::where('user_id', $userId)
            ->whereBetween('created_at', [$lastStart, $lastEnd])
            ->sum('flow_rate');

        $percentage = 0.0;
        if ($lastWeek > 0) {
            $percentage = (($thisWeek - $lastWeek) / $lastWeek) * 100.0;
        } elseif ($thisWeek > 0) {
            $percentage = 100.0;
        }

        return $this->success([
            'this_week' => $thisWeek,
            'last_week' => $lastWeek,
            'percentage' => round($percentage, 2),
        ]);
    }
}

