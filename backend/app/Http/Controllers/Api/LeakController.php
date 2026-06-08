<?php

namespace App\Http\Controllers\Api;

use App\Models\Sensor;
use App\Models\WaterReading;
use Illuminate\Http\Request;

class LeakController extends BaseApiController
{
    public function status(Request $request)
    {
        $userId = $request->user()->id;
        $reading = WaterReading::where('user_id', $userId)->latest()->first();
        $sensor = Sensor::where('user_id', $userId)->orderBy('id')->first();

        $flowRate = $reading?->flow_rate;
        $detected = is_numeric($flowRate) && $flowRate > 20;

        return $this->success([
            'leak_detected' => $detected,
            'flow_rate' => $flowRate,
            'location' => $sensor?->location,
        ]);
    }
}

