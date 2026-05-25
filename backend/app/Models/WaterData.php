<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterData extends Model
{
    protected $fillable = [
        'flow_rate',
        'total_liters',
        'leak_detected',
        'valve_status'
    ];
    
    protected $casts = [
        'leak_detected' => 'boolean',
        'flow_rate' => 'float',
        'total_liters' => 'float',
    ];
}
