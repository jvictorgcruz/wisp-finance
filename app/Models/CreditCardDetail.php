<?php

namespace App\Models;

use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditCardDetail extends Model
{
    /** @use HasFactory */
    use HasFactory, SoftDeletes, HasLedger;

    protected $fillable = [
        'account_id',
        'ledger_id',
        'limit',
        'closing_day',
        'due_day',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'limit' => 'integer',
            'closing_day' => 'integer',
            'due_day' => 'integer',
        ];
    }

    /**
     * Get the account that owns the credit card details.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
