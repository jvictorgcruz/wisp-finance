<?php

namespace App\Traits;

use App\Models\Scopes\LedgerScope;
use App\Models\Ledger;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait HasLedger
{
    /**
     * Boot the trait's global scope and event listeners.
     */
    public static function bootHasLedger(): void
    {
        static::addGlobalScope(new LedgerScope());

        static::creating(function ($model) {
            if (empty($model->ledger_id)) {
                $model->ledger_id = static::resolveLedgerId();
            }
        });
    }

    /**
     * Resolve the current ledger ID for assignment.
     */
    protected static function resolveLedgerId(): ?int
    {
        return \App\Support\LedgerContext::currentId();
    }

    /**
     * Get the ledger that owns the model.
     */
    public function ledger(): BelongsTo
    {
        return $this->belongsTo(Ledger::class);
    }
}
