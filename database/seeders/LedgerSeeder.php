<?php

namespace Database\Seeders;

use App\Models\Ledger;
use App\Actions\Ledgers\CreateDefaultAccountsAction;
use Illuminate\Database\Seeder;

class LedgerSeeder extends Seeder
{
    /**
     * Run the database seeds for a specific ledger.
     */
    public function run(Ledger $ledger): void
    {
        // Populate the base chart of accounts using the standard action
        $action = new CreateDefaultAccountsAction();
        $action->execute($ledger);

        // Inject initial balances via AccountBalanceSeeder
        $this->callWith(AccountBalanceSeeder::class, ['ledger' => $ledger]);
    }
}
