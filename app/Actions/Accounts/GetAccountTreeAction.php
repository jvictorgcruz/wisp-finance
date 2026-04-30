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
        $accounts = Account::with(['children', 'creditCardDetail'])
            ->whereNull('parent_id')
            ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
            ->orderBy('type', 'ASC')
            ->get();

        // Collect all child IDs for batch balance calculation
        $allChildIds = $accounts->pluck('children.*.id')->flatten()->unique();
        $balances = $this->balanceAction->execute($allChildIds);

        $mappedAccounts = $accounts->map(function (Account $account) use ($balances) {
            $parentKey = str_replace(['accounts.', 'categories.'], '', $account->name);

            // Map children with their pre-calculated balances
            $mappedChildren = $account->children->map(function (Account $child) use ($parentKey, $balances) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'type' => $child->type,
                    'status' => $child->status,
                    'parent_id' => $child->parent_id,
                    'is_system' => $child->is_system,
                    'ui_metadata' => $child->ui_metadata,
                    'balance' => $balances->get($child->id, 0),
                    'has_history' => $child->journalEntries()->exists(),
                    'parent_Key' => $parentKey,
                    'is_credit_card' => $child->is_credit_card,
                    'credit_card_details' => $child->creditCardDetail ? [
                        'limit' => $child->creditCardDetail->limit,
                        'closing_day' => $child->creditCardDetail->closing_day,
                        'due_day' => $child->creditCardDetail->due_day,
                        'invoice_control_enabled' => $child->creditCardDetail->invoice_control_enabled,
                    ] : null,
                ];
            });

            // Parent balance is the sum of children's balances
            $aggregatedBalance = $mappedChildren->sum('balance');

            return [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'status' => $account->status,
                'parent_id' => $account->parent_id,
                'is_system' => $account->is_system,
                'ui_metadata' => $account->ui_metadata,
                'balance' => $aggregatedBalance,
                'has_history' => $account->journalEntries()->exists(),
                'parent_Key' => $parentKey,
                'is_credit_card' => $account->is_credit_card,
                'credit_card_details' => $account->creditCardDetail ? [
                    'limit' => $account->creditCardDetail->limit,
                    'closing_day' => $account->creditCardDetail->closing_day,
                    'due_day' => $account->creditCardDetail->due_day,
                    'invoice_control_enabled' => $account->creditCardDetail->invoice_control_enabled,
                ] : null,
                'children' => $mappedChildren,
            ];
        });

        return [
            'accounts' => $mappedAccounts,
            'totals' => [
                'assets' => $mappedAccounts->where('type', AccountType::ASSET)->sum('balance'),
                'liabilities' => $mappedAccounts->where('type', AccountType::LIABILITY)->sum('balance'),
            ],
            'root_categories' => \App\Support\DefaultAccountDefinitions::getUiRootCategories(),
            'available_colors' => \App\Support\DefaultAccountDefinitions::getAvailableColors(),
            'available_icons' => \App\Support\DefaultAccountDefinitions::getAvailableIcons(),
        ];
    }
}
