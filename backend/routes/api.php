<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WaterController;
use App\Http\Controllers\Api\WaterDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (nécessitent un token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Anciennes routes (système d'eau)
    Route::get('/water/latest', [WaterController::class, 'getLatestData']);
    Route::get('/water/alerts', [WaterController::class, 'getAlerts']);
    Route::post('/water/valve', [WaterController::class, 'toggleValve']);
});

// Route pour l'ESP32 (Ancien système)
Route::post('/water/store', [WaterController::class, 'storeReading']);


// ==========================================
// NEW WATER LEAK GUARDIAN ROUTES
// ==========================================
Route::post('/water-data', [WaterDataController::class, 'store']);
Route::get('/water-data', [WaterDataController::class, 'index']);
Route::get('/water-data/leaks', [WaterDataController::class, 'leaks']);
Route::get('/water-data/today', [WaterDataController::class, 'today']);
Route::get('/water-data/stats', [WaterDataController::class, 'stats']);
