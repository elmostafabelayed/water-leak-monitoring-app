<?php

namespace App\Http\Controllers\Api;

use App\Models\ValveLog;
use App\Models\WaterReading;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ValveController extends BaseApiController
{
    public function control(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:open,close',
        ]);

        if ($validator->fails()) {
            return $this->failure($validator->errors()->first(), 422);
        }

        $action = $request->string('action')->toString();
        $userId = $request->user()->id;

        ValveLog::create([
            'user_id' => $userId,
            'action' => strtoupper($action),
            'triggered_by' => 'USER',
        ]);

        // Tell the ESP32 what to do next time it pings
        \Illuminate\Support\Facades\Cache::put('target_valve_state', $action, now()->addMinutes(5));

        // Update the latest WaterReading so the UI reflects the change immediately
        $latestReading = WaterReading::where('user_id', $userId)->latest()->first();
        if ($latestReading) {
            $latestReading->update(['valve_status' => $action === 'open' ? 'open' : 'closed']);
        }

        return $this->success(['action' => $action]);
    }

    public function status(Request $request)
    {
        $userId = $request->user()->id;
        $latest = WaterReading::where('user_id', $userId)->latest()->first();
        
        return $this->success([
            'valve_status' => $latest?->valve_status ?? 'open',
            'updated_at' => $latest?->updated_at?->toIso8601String(),
        ]);
    }
}
