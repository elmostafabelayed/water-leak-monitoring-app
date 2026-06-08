<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\SensorReadingFactory;

class WaterReading extends Model
{
    use HasFactory;

    protected static function newFactory(): SensorReadingFactory
    {
        return SensorReadingFactory::new();
    }
    protected $fillable = [
        'user_id',
        'sensor_id',
        'flow_rate',
        'pressure',
        'temperature',
        'valve_status',
        'is_leak',
        'battery_level',
        'signal_strength',
    ];

    protected $casts = [
        'flow_rate' => 'float',
        'pressure' => 'float',
        'temperature' => 'float',
        'is_leak' => 'boolean',
    ];
}
