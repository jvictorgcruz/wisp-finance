<?php

namespace App\Actions\Accounts;

use App\Models\Account;
use App\Enums\AccountType;
use Illuminate\Support\Collection;

class GetAccountTreeAction
{
    public function __construct(
        protected GetAccountBalanceAction $balanceAction
    ) {
    }

    /**
     * Execute the action to retrieve a nested account tree with balances.
     * Only includes Assets and Liabilities.
     */
    public function execute(): array
    {
        $accounts = Account::with('children')
            ->whereNull('parent_id')
            ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
            ->get()
            ->map(function ($account) {
                // Map children with their balances and runtime translation
                $mappedChildren = $account->children->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'name' => $child->is_system ? __($child->name) : $child->name,
                        'type' => $child->type,
                        'status' => $child->status,
                        'balance' => $this->balanceAction->execute($child),
                    ];
                });

                // Parent balance is the sum of children's balances
                $aggregatedBalance = $mappedChildren->sum('balance');

                return [
                    'id' => $account->id,
                    'name' => $account->is_system ? __($account->name) : $account->name,
                    'type' => $account->type,
                    'status' => $account->status,
                    'balance' => $aggregatedBalance,
                    'children' => $mappedChildren,
                ];
            });

        return [
            'accounts' => $accounts,
            'totals' => [
                'assets' => $accounts->where('type', AccountType::ASSET)->sum('balance'),
                'liabilities' => $accounts->where('type', AccountType::LIABILITY)->sum('balance'),
            ],
        ];
    }
}
