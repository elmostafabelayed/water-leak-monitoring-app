<?php

namespace App\Http\Controllers\Api;

use App\Models\Sensor;
use App\Models\WaterReading;
use Illuminate\Http\Request;

class DeviceController extends BaseApiController
{
    public function info(Request $request)
    {
        $userId = $request->user()->id;
        $sensor = Sensor::where('user_id', $userId)->orderBy('id')->first();
        $reading = WaterReading::where('user_id', $userId)->latest()->first();

        $uptime = $sensor?->uptime_seconds;

        return $this->success([
            'signal' => $sensor?->signal ?? $reading?->signal_strength,
            'ssid' => $sensor?->ssid,
            'battery' => $sensor?->battery ?? $reading?->battery_level,
            'firmware' => $sensor?->firmware,
            'uptime' => $uptime ? $this->formatUptime((int) $uptime) : null,
            'node_id' => $sensor?->node_id,
        ]);
    }

    private function formatUptime(int $seconds): string
    {
        $days = intdiv($seconds, 86400);
        $hours = intdiv($seconds % 86400, 3600);
        $mins = intdiv($seconds % 3600, 60);
        return "{$days}j {$hours}h {$mins}m";
    }
}

