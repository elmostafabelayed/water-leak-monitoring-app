<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sensor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'location',
        'last_reading',
        'last_seen_at',
        'uptime_seconds',
        'signal',
        'battery',
        'firmware',
        'ssid',
        'node_id',
    ];

    protected $casts = [
        'last_reading' => 'float',
        'last_seen_at' => 'datetime',
        'uptime_seconds' => 'integer',
        'signal' => 'integer',
        'battery' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

