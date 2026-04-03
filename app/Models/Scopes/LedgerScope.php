<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class LedgerScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $ledgerId = $this->getLedgerId();

        if ($ledgerId) {
            $builder->where($model->getTable() . '.ledger_id', $ledgerId);
        }
    }

    /**
     * Resolve the current ledger ID.
     */
    protected function getLedgerId(): ?int
    {
        // Prioritize session if available
        if (request()->hasSession() && session()->has('current_ledger_id')) {
            return (int) session('current_ledger_id');
        }

        // Fallback to authenticated user's first ledger
        if (Auth::check()) {
            return Auth::user()->currentLedger()?->id;
        }

        return null;
    }
}
