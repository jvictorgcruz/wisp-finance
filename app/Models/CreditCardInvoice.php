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

    protected $appends = [
        'total_amount',
        'paid_amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'closing_date' => 'datetime',
        ];
    }

    /**
     * Resolve (find or create) an invoice for a specific card and transaction date.
     */
    public static function resolveForCardAndDate(CreditCardDetail $card, Carbon $date): self
    {
        // 1. Calculate the closing date for the month of the transaction
        $closingDate = $date->copy()->day($card->closing_day);

        // 2. If transaction is after closing, it goes to the next month
        $referenceDate = $date->copy();
        if ($date->greaterThan($closingDate)) {
            $referenceDate->addMonth();
        }

        $reference = $referenceDate->format('Y-m');

        return self::firstOrCreate(
            [
                'credit_card_detail_id' => $card->id,
                'reference_year_month' => $reference,
            ],
            [
                'closing_date' => $referenceDate->copy()->day($card->closing_day),
                'due_date' => $referenceDate->copy()->day($card->due_day),
            ]
        );
    }

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
     * Resolve the most relevant invoice for the card (unpaid or current).
     */
    public static function resolveActiveInvoice(CreditCardDetail $card): self
    {
        // 1. Try to find the oldest invoice that is not fully paid
        $unpaidInvoice = self::where('credit_card_detail_id', $card->id)
            ->whereHas('expectedCashFlows', function ($query) {
                $query->where('status', '!=', 'PAID');
            })
            ->orderBy('reference_year_month', 'asc')
            ->first();

        if ($unpaidInvoice) {
            return $unpaidInvoice;
        }

        // 2. If all paid, return the invoice for the current date
        return self::resolveForCardAndDate($card, Carbon::now());
    }

    /**
     * Accessors
     */

    protected function totalAmount(): Attribute
    {
        // Using query builder sum() to get raw BigInt (cents) as integer
        return Attribute::get(fn () => (int) $this->expectedCashFlows()->sum('amount'));
    }

    protected function paidAmount(): Attribute
    {
        // Using query builder sum() to get raw BigInt (cents) as integer
        return Attribute::get(fn () => (int) $this->expectedCashFlows()->where('status', 'PAID')->sum('amount'));
    }

    protected function status(): Attribute
    {
        return Attribute::get(function () {
            $total = $this->total_amount;
            $paid = $this->paid_amount;
            
            // Financial comparison in cents
            $isPaid = $total > 0 && $paid >= $total;

            if ($isPaid) {
                return 'PAID';
            }

            $today = Carbon::today();

            if ($today < $this->closing_date) {
                return 'OPEN';
            }

            if ($today <= $this->due_date) {
                return 'CLOSED';
            }

            return 'OVERDUE';
        });
    }

    /**
     * Helpers
     */

    public function isPaid(): bool
    {
        return $this->status === 'PAID';
    }

    public function isClosed(): bool
    {
        return in_array($this->status, ['CLOSED', 'PAID', 'OVERDUE']);
    }
}
