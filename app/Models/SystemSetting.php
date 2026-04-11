<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'title',
        'description',
        'is_active',
        'value'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
