<?php

namespace App\Models;

use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntry extends Model
{
    /** @use HasFactory */
    use HasFactory, HasLedger;

    protected $fillable = [
        'ledger_id',
        'account_id',
        'type',
        'amount',
        'entry_date',
    ];

    protected function casts(): array
    {
        return [
            'type' => 'string', // Could use an enum if defined
            'amount' => 'integer',
            'entry_date' => 'date',
        ];
    }

    /**
     * Get the account this entry belongs to.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
