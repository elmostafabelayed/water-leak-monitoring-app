<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WaterData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WaterDataController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'nullable|string',
            'flow_rate' => 'required|numeric',
            'total_liters' => 'required|numeric',
            'status' => 'required|string',
            'valve_open' => 'required|boolean',
            'mode' => 'required|string',
            'leak_detected' => 'required|boolean',
            'force_notify' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid data payload',
                'data' => $validator->errors()
            ], 422);
        }

        $waterData = WaterData::create($request->all());

        $targetState = \Illuminate\Support\Facades\Cache::get('target_valve_state');
        $command = null;
        if ($targetState) {
            $currentState = $request->boolean('valve_open') ? 'open' : 'close';
            if ($targetState !== $currentState) {
                $command = $targetState;
            } else {
                \Illuminate\Support\Facades\Cache::forget('target_valve_state');
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data saved successfully',
            'data' => $waterData,
            'command' => $command
        ], 201);
    }

    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data retrieved successfully',
            'data' => [
                'latest' => WaterData::latest()->first(),
                'history' => WaterData::latest()->take(50)->get()
            ]
        ]);
    }

    public function leaks()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Leaks retrieved successfully',
            'data' => WaterData::where('leak_detected', true)->latest()->take(20)->get()
        ]);
    }

    public function today()
    {
        $todayData = WaterData::whereDate('created_at', today())->get();
        
        // Calculate consumption by taking difference between max and min total_liters for today
        $minLiters = $todayData->min('total_liters') ?? 0;
        $maxLiters = $todayData->max('total_liters') ?? 0;
        $todayConsumption = max(0, $maxLiters - $minLiters);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Today consumption retrieved',
            'data' => [
                'today_liters_consumed' => $todayConsumption,
                'readings_count' => $todayData->count()
            ]
        ]);
    }

    public function stats()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Stats retrieved successfully',
            'data' => [
                'total_leaks' => WaterData::where('leak_detected', true)->count(),
                'avg_flow_rate' => round(WaterData::avg('flow_rate'), 2),
                'max_flow_rate' => WaterData::max('flow_rate'),
                'total_records' => WaterData::count()
            ]
        ]);
    }
}
