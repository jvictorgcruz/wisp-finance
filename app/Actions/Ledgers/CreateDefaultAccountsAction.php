<?php

namespace App\Actions\Ledgers;

use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use App\Support\DefaultAccountDefinitions;

class CreateDefaultAccountsAction
{
    /**
     * Execute the action to seed default accounts for a ledger.
     */
    public function execute(Ledger $ledger): void
    {
        $accounts = DefaultAccountDefinitions::get();

        foreach ($accounts as $definition) {
            $this->createAccountRecursive($ledger, $definition);
        }
    }

    /**
     * Create accounts recursively to maintain hierarchy.
     */
    protected function createAccountRecursive(Ledger $ledger, array $definition, ?int $parentId = null): void
    {
        $account = Account::firstOrCreate([
            'ledger_id' => $ledger->id,
            'name' => $definition['name'],
            'parent_id' => $parentId,
            'type' => $definition['type'],
            'is_system' => true,
        ], [
            'status' => AccountStatus::ACTIVE,
        ]);

        if (isset($definition['children'])) {
            foreach ($definition['children'] as $childDefinition) {
                $this->createAccountRecursive($ledger, $childDefinition, $account->id);
            }
        }
    }
}
