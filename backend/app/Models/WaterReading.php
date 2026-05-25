<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterReading extends Model
{
    protected $fillable = [
        'user_id',
        'flow_rate',
        'pressure',
        'is_leak',
        'battery_level',
        'signal_strength',
    ];
}
