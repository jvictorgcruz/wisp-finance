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
        $ledgerId = \App\Support\LedgerContext::currentId();

        if ($ledgerId) {
            $builder->where($model->getTable() . '.ledger_id', $ledgerId);
        }
    }
}
