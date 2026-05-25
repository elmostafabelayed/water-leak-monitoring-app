<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WaterReading;
use App\Models\Alert;
use App\Models\ValveLog;
use Illuminate\Http\Request;

class WaterController extends Controller
{
    // Récupérer les dernières données (pour l'app mobile)
    public function getLatestData(Request $request)
    {
        $reading = WaterReading::where('user_id', $request->user()->id)
            ->latest()
            ->first();

        return response()->json($reading);
    }

    // Recevoir les données de l'ESP32
    public function storeReading(Request $request)
    {
        // Note: L'ESP32 doit envoyer le user_id ou un jeton d'appareil
        $reading = WaterReading::create([
            'user_id' => $request->user_id,
            'flow_rate' => $request->flow_rate,
            'pressure' => $request->pressure,
            'is_leak' => $request->is_leak,
            'battery_level' => $request->battery_level,
            'signal_strength' => $request->signal_strength,
        ]);

        // Si une fuite est détectée, créer une alerte automatique
        if ($request->is_leak) {
            Alert::create([
                'user_id' => $request->user_id,
                'type' => 'LEAK_DETECTED',
                'severity' => 'CRITICAL',
                'description' => 'Une fuite importante a été détectée sur la ligne principale.',
            ]);
            
            // Log automatique de fermeture de vanne
            ValveLog::create([
                'user_id' => $request->user_id,
                'action' => 'CLOSE',
                'triggered_by' => 'SYSTEM',
            ]);
        }

        return response()->json(['status' => 'success', 'data' => $reading]);
    }

    // Récupérer l'historique des alertes
    public function getAlerts(Request $request)
    {
        $alerts = Alert::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($alerts);
    }

    // Contrôler la vanne (depuis l'app)
    public function toggleValve(Request $request)
    {
        $action = $request->action; // OPEN ou CLOSE

        ValveLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'triggered_by' => 'USER',
        ]);

        return response()->json(['status' => 'success', 'action' => $action]);
    }
}
