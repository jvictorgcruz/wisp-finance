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
    use HasFactory, SoftDeletes, HasLedger, \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['name', 'status', 'type', 'parent_id', 'is_credit_card'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('domain');
    }

    public function getDescriptionForEvent(string $eventName): string
    {
        if ($eventName === 'updated') {
            if ($this->isDirty('status') && $this->status === AccountStatus::INACTIVE) {
                return match (true) {
                    $this->is_credit_card => 'credit_card.inactivated',
                    $this->type === AccountType::ASSET => 'account.inactivated',
                    $this->type === AccountType::LIABILITY => 'liability.inactivated',
                    in_array($this->type, [AccountType::EXPENSE, AccountType::REVENUE]) => 'category.inactivated',
                    default => 'account.inactivated'
                };
            }
        }

        return match (true) {
            $this->is_credit_card => "credit_card.{$eventName}",
            $this->type === AccountType::ASSET => "account.{$eventName}",
            $this->type === AccountType::LIABILITY => "liability.{$eventName}",
            in_array($this->type, [AccountType::EXPENSE, AccountType::REVENUE]) => "category.{$eventName}",
            default => "account.{$eventName}"
        };
    }

    public function tapActivity(\Spatie\Activitylog\Models\Activity $activity, string $eventName)
    {
        $activity->ledger_id = $this->ledger_id;
    }

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
