<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\LeakController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\ValveController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/sensor/latest', [SensorController::class, 'latest']);
        Route::get('/flow/history', [SensorController::class, 'history']);
        Route::get('/sensors', [SensorController::class, 'sensors']);
        Route::get('/sensors/{id}/data', [SensorController::class, 'sensorData']);

        Route::post('/valve/control', [ValveController::class, 'control']);
        Route::get('/valve/status', [ValveController::class, 'status']);

        Route::get('/stats/weekly', [StatsController::class, 'weekly']);
        Route::get('/stats/monthly', [StatsController::class, 'monthly']);
        Route::get('/stats/saved', [StatsController::class, 'saved']);
        Route::get('/stats/peak-hours', [StatsController::class, 'peakHours']);
        Route::get('/stats/comparison', [StatsController::class, 'comparison']);

        Route::get('/alerts', [AlertController::class, 'index']);
        Route::post('/alerts/{id}/acknowledge', [AlertController::class, 'acknowledge']);
        Route::get('/alerts/unread-count', [AlertController::class, 'unreadCount']);

        Route::get('/leak/status', [LeakController::class, 'status']);

        Route::get('/settings', [SettingsController::class, 'index']);
        Route::post('/settings', [SettingsController::class, 'update']);

        Route::get('/device/info', [DeviceController::class, 'info']);
    });
});
