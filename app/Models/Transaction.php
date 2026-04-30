<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    /** @use HasFactory */
    use HasFactory, HasLedger;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        // By default, only show active, non-reversed transactions in the UI.
        // Reversed transactions and their reversals are kept for audit but hidden.
        static::addGlobalScope('active', function ($query) {
            $query->whereNull('reversed_by_id')
                  ->whereNull('reverses_id');
        });
    }

    protected $fillable = [
        'ledger_id',
        'created_by_user_id',
        'date',
        'description',
        'type',
        'status',
        'reversed_by_id',
        'reverses_id',
        'metadata',
    ];

    protected $attributes = [
        'type' => TransactionType::EXPENSE,
        'status' => TransactionStatus::ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'type' => TransactionType::class,
            'status' => TransactionStatus::class,
            'metadata' => 'json',
        ];
    }

    /**
     * Get the journal entries associated with this transaction.
     */
    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    /**
     * Get the expected cash flows associated with this transaction.
     */
    public function expectedCashFlows(): HasMany
    {
        return $this->hasMany(ExpectedCashFlow::class);
    }

    /**
     * Get the user who created this transaction.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get the transaction that reversed this one.
     */
    public function reversal(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'reversed_by_id');
    }

    /**
     * Get the original transaction that this one reverses.
     */
    public function original(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'reverses_id');
    }

    /**
     * Check if the transaction is reversed.
     */
    public function isReversed(): bool
    {
        return $this->status === TransactionStatus::REVERSED;
    }

    /**
     * Check if the transaction is a reversal.
     */
    public function isAReversal(): bool
    {
        return !is_null($this->reverses_id);
    }
}
