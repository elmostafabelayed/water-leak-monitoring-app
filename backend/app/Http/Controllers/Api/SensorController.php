<?php

namespace App\Http\Controllers\Api;

use App\Models\Sensor;
use App\Models\WaterReading;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SensorController extends BaseApiController
{
    public function latest(Request $request)
    {
        $userId = $request->user()->id;

        $reading = WaterReading::where('user_id', $userId)->latest()->first();

        $dailyUsage = (float) WaterReading::where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->sum('flow_rate');

        return $this->success([
            'flow_rate' => $reading?->flow_rate,
            'pressure' => $reading?->pressure,
            'valve_status' => $reading?->valve_status ?? 'open',
            'daily_usage' => $dailyUsage,
        ]);
    }

    public function history(Request $request)
    {
        $userId = $request->user()->id;
        $since = Carbon::now()->subMinutes(60);

        $rows = WaterReading::where('user_id', $userId)
            ->where('created_at', '>=', $since)
            ->orderBy('created_at')
            ->get(['created_at', 'flow_rate']);

        $data = $rows->map(fn ($r) => [
            'time' => $r->created_at?->toIso8601String(),
            'flow_rate' => $r->flow_rate,
        ])->values();

        return $this->success(['data' => $data]);
    }

    public function sensors(Request $request)
    {
        $userId = $request->user()->id;
        $sensors = Sensor::where('user_id', $userId)->orderBy('id')->get();

        $data = $sensors->map(function (Sensor $s) {
            $online = $s->last_seen_at && $s->last_seen_at->gt(Carbon::now()->subMinutes(5));
            return [
                'id' => $s->id,
                'name' => $s->name,
                'location' => $s->location,
                'status' => $online ? 'online' : 'offline',
                'last_reading' => $s->last_reading,
            ];
        })->values();

        return $this->success($data);
    }

    public function sensorData(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $sensor = Sensor::where('user_id', $userId)->where('id', $id)->first();
        if (!$sensor) return $this->failure('Capteur introuvable', 404);

        $reading = WaterReading::where('user_id', $userId)
            ->where(function ($q) use ($id) {
                $q->where('sensor_id', $id)->orWhereNull('sensor_id');
            })
            ->latest()
            ->first();

        return $this->success([
            'flow_rate' => $reading?->flow_rate,
            'pressure' => $reading?->pressure,
            'uptime' => $sensor->uptime_seconds ? $sensor->uptime_seconds : null,
            'signal' => $sensor->signal ?? $reading?->signal_strength,
            'firmware' => $sensor->firmware,
        ]);
    }
}
