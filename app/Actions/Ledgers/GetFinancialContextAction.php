<?php

namespace App\Actions\Ledgers;

use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;

class GetFinancialContextAction
{
    /**
     * Execute the action to get financial context for a ledger.
     *
     * @param int $ledgerId
     * @return array
     */
    public function execute(int $ledgerId): array
    {
        return [
            'accounts' => Account::where('ledger_id', $ledgerId)
                ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
                ->whereNotNull('parent_id')
                ->whereDoesntHave('children') // Only leaf accounts can receive transactions
                ->where('status', AccountStatus::ACTIVE)
                ->get(['id', 'name', 'type', 'ui_metadata', 'is_credit_card']),
                
            'categories' => Account::where('ledger_id', $ledgerId)
                ->whereIn('type', [AccountType::REVENUE, AccountType::EXPENSE])
                ->whereNotNull('parent_id')
                ->whereDoesntHave('children') // Only leaf categories can receive transactions
                ->where('status', AccountStatus::ACTIVE)
                ->with('parent:id,name')
                ->get(['id', 'name', 'type', 'ui_metadata', 'parent_id']),
        ];
    }
}
