<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeakEvent extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'severity',
        'flow_rate_detected',
        'location',
        'auto_closed',
        'response_time_ms',
    ];

    protected $casts = [
        'auto_closed' => 'boolean',
        'flow_rate_detected' => 'float',
        'response_time_ms' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
