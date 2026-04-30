<?php

namespace App\Actions\Dashboards;

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Enums\AccountType;
use App\Models\Account;
use App\Support\LedgerContext;

class GetDashboardSummaryAction
{
    public function __construct(
        protected GetAccountBalanceAction $getBalanceAction
    ) {}

    /**
     * Get the total assets and liabilities for the current ledger.
     * 
     * @return array{total_assets: int, total_liabilities: int}
     */
    public function execute(): array
    {
        $ledgerId = LedgerContext::currentId();

        if (!$ledgerId) {
            return [
                'total_assets' => 0,
                'total_liabilities' => 0,
            ];
        }

        // Fetch all asset and liability accounts for this ledger
        $accounts = Account::where('ledger_id', $ledgerId)
            ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
            ->get(['id', 'type']);

        $balances = $this->getBalanceAction->execute($accounts->pluck('id'));

        $totalAssets = 0;
        $totalLiabilities = 0;

        foreach ($accounts as $account) {
            $balance = $balances->get($account->id, 0);
            
            if ($account->type === AccountType::ASSET) {
                $totalAssets += $balance;
            } elseif ($account->type === AccountType::LIABILITY) {
                $totalLiabilities += $balance;
            }
        }

        return [
            'total_assets' => $totalAssets,
            'total_liabilities' => $totalLiabilities,
        ];
    }
}
