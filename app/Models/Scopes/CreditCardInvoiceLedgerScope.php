<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Support\LedgerContext;

class CreditCardInvoiceLedgerScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $ledgerId = LedgerContext::currentId();

        if ($ledgerId) {
            $builder->whereHas('creditCardDetail.account', function ($query) use ($ledgerId) {
                $query->where('ledger_id', $ledgerId);
            });
        }
    }
}
