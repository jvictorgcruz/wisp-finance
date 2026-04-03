<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    /** @use HasFactory */
    use HasFactory, SoftDeletes, HasLedger;

    protected $fillable = [
        'ledger_id',
        'name',
        'type',
        'status',
        'is_system',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AccountType::class,
            'status' => AccountStatus::class,
            'is_system' => 'boolean',
        ];
    }
}
