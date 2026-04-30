<?php

namespace App\Models;

use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    /** @use HasFactory */
    use HasFactory, HasLedger, SoftDeletes;

    protected $fillable = [
        'ledger_id',
        'date',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
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
}
