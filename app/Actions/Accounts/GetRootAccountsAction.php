<?php

namespace App\Actions\Accounts;

use App\Models\Account;
use App\Enums\AccountType;
use App\Support\LedgerContext;
use Illuminate\Support\Collection;

class GetRootAccountsAction
{
    /**
     * Get all root accounts (those without a parent) for Assets and Liabilities.
     */
    public function execute(): Collection
    {
        return Account::where('ledger_id', LedgerContext::currentId())
            ->whereNull('parent_id')
            ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
            ->get();
    }
}
