<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterData extends Model
{
    protected $fillable = [
        'device_id',
        'flow_rate',
        'total_liters',
        'status',
        'valve_open',
        'mode',
        'leak_detected',
        'force_notify'
    ];
    
    protected $casts = [
        'leak_detected' => 'boolean',
        'valve_open' => 'boolean',
        'force_notify' => 'boolean',
        'flow_rate' => 'float',
        'total_liters' => 'float',
    ];
}
