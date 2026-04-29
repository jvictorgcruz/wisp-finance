<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Traits\HasLedger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    /** @use HasFactory */
    use HasFactory, SoftDeletes, HasLedger;

    protected $fillable = [
        'ledger_id',
        'parent_id',
        'name',
        'type',
        'status',
        'is_system',
        'is_credit_card',
        'ui_metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AccountType::class,
            'status' => AccountStatus::class,
            'is_system' => 'boolean',
            'is_credit_card' => 'boolean',
            'ui_metadata' => 'array',
        ];
    }

    /**
     * Get the parent account.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    /**
     * Get the children accounts.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    /**
     * Get the journal entries for this account.
     */
    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::deleting(function (Account $account) {
            if ($account->forceDeleting) {
                $account->creditCardDetail()->forceDelete();
            } else {
                $account->creditCardDetail()->delete();
            }
        });

        static::restoring(function (Account $account) {
            $account->creditCardDetail()->restore();
        });
    }

    /**
     * Determine if this account can have direct journal entries.
     * Rule: Root accounts (parents) cannot have direct transactions.
     */
    public function canHaveJournalEntries(): bool
    {
        return $this->parent_id !== null;
    }

    /**
     * Get the credit card details for this account.
     */
    public function creditCardDetail(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CreditCardDetail::class);
    }
}
