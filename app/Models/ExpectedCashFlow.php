<?php

namespace App\Models;

use App\Casts\Money;
use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpectedCashFlow extends Model
{
    /** @use HasFactory */
    use HasFactory, SoftDeletes;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\ExpectedCashFlowLedgerScope());
    }

    protected $fillable = [
        'transaction_id',
        'account_id',
        'amount',
        'due_date',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => Money::class,
            'due_date' => 'date',
            'status' => 'string', // Could use an enum
        ];
    }

    /**
     * Get the transaction this cash flow is linked to.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the account this cash flow belongs to.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
