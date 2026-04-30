<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Support\LedgerContext;

class CreditCardDetailLedgerScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $ledgerId = LedgerContext::currentId();

        if ($ledgerId) {
            $builder->whereHas('account', function ($query) use ($ledgerId) {
                $query->where('ledger_id', $ledgerId);
            });
        }
    }
}
