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

        static::addGlobalScope('active_transactions', function ($query) {
            $query->whereHas('transaction', function ($q) {
                // Transaction model has a default global scope 'active' that already handles this,
                // but we are explicit here for safety.
                $q->whereNull('reversed_by_id')->whereNull('reverses_id');
            })->orWhereNull('transaction_id');
        });
    }

    protected $fillable = [
        'transaction_id',
        'account_id',
        'credit_card_invoice_id',
        'amount',
        'due_date',
        'installment_number',
        'installment_total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => Money::class,
            'due_date' => 'date',
            'credit_card_invoice_id' => 'integer',
            'installment_number' => 'integer',
            'installment_total' => 'integer',
            'status' => 'string',
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

    /**
     * Get the invoice this cash flow belongs to.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(CreditCardInvoice::class, 'credit_card_invoice_id');
    }
}
