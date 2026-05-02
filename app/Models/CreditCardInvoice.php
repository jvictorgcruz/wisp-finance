<?php

namespace App\Models;

use App\Models\Scopes\CreditCardInvoiceLedgerScope;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class CreditCardInvoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new CreditCardInvoiceLedgerScope());
    }

    protected $fillable = [
        'credit_card_detail_id',
        'reference_year_month',
        'due_date',
        'closing_date',
    ];

    protected $casts = [
        'due_date' => 'date',
        'closing_date' => 'date',
    ];

    /**
     * Relationships
     */

    public function creditCardDetail(): BelongsTo
    {
        return $this->belongsTo(CreditCardDetail::class);
    }

    public function expectedCashFlows(): HasMany
    {
        return $this->hasMany(ExpectedCashFlow::class, 'credit_card_invoice_id');
    }

    /**
     * Accessors
     */

    protected function totalAmount(): Attribute
    {
        return Attribute::get(fn () => $this->expectedCashFlows->sum('amount'));
    }

    protected function paidAmount(): Attribute
    {
        return Attribute::get(fn () => $this->expectedCashFlows->where('status', 'paid')->sum('amount'));
    }

    protected function status(): Attribute
    {
        return Attribute::get(function () {
            $total = $this->total_amount;
            $paid = $this->paid_amount;
            $isPaid = $total > 0 && $paid >= $total;

            if ($isPaid) {
                return 'paid';
            }

            $today = Carbon::today();

            if ($today < $this->closing_date) {
                return 'open';
            }

            if ($today <= $this->due_date) {
                return 'closed';
            }

            return 'overdue';
        });
    }
}
