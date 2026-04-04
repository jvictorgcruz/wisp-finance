<?php

namespace App\Observers;

use App\Models\Ledger;
use App\Actions\Ledgers\CreateDefaultAccountsAction;

class LedgerObserver
{
    /**
     * Handle the Ledger "created" event.
     */
    public function created(Ledger $ledger): void
    {
        app(CreateDefaultAccountsAction::class)->execute($ledger);
    }
}
