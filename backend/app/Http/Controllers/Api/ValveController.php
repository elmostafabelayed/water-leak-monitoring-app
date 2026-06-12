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

        return $this->success(['action' => $action]);
    }

    public function status(Request $request)
    {
        $latest = \App\Models\WaterData::latest()->first();
        
        // If we have a pending target state, we can return that so the UI updates immediately,
        // or just return the actual hardware state. Let's return actual hardware state.
        return $this->success([
            'valve_status' => $latest && $latest->valve_open ? 'open' : 'closed',
            'updated_at' => $latest?->updated_at?->toIso8601String(),
        ]);
    }
}
