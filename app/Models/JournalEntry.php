<?php

namespace App\Models;

use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntry extends Model
{
    /** @use HasFactory */
    use HasFactory;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\JournalEntryLedgerScope());
    }
 
    /**
     * The table is immutable; only created_at is maintained.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'transaction_id',
        'account_id',
        'type',
        'amount',
        'entry_date',
    ];

    protected function casts(): array
    {
        return [
            'type' => 'string',
            'amount' => \App\Casts\Money::class,
            'entry_date' => 'date',
        ];
    }

    /**
     * Get the transaction this entry belongs to.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the account this entry belongs to.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
