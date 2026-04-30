<?php

namespace App\Models;

use App\Casts\Money;
use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditCardDetail extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\CreditCardDetailLedgerScope());
    }

    protected $fillable = [
        'account_id',
        'limit',
        'closing_day',
        'due_day',
        'invoice_control_enabled',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'limit' => Money::class,
            'closing_day' => 'integer',
            'due_day' => 'integer',
            'invoice_control_enabled' => 'boolean',
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
