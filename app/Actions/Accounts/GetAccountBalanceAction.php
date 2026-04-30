<?php

namespace App\Actions\Accounts;

use App\Enums\AccountType;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class GetAccountBalanceAction
{
    /**
     * Calculate the current balance of an account based on its type.
     */
    public function execute(Account $account): int
    {
        $totals = $account->journalEntries()
            ->select('type', DB::raw('SUM(amount) as total'))
            ->groupBy('type')
            ->pluck('total', 'type');


        $debits = (int) ($totals['DEBIT'] ?? 0);
        $credits = (int) ($totals['CREDIT'] ?? 0);

        return match ($account->type) {
            AccountType::ASSET, AccountType::EXPENSE => $debits - $credits,
            AccountType::LIABILITY, AccountType::EQUITY, AccountType::REVENUE => $credits - $debits,
            default => 0,
        };
    }
}
