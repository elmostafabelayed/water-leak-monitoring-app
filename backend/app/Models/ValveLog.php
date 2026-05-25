<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValveLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'triggered_by',
    ];
}
