<?php

namespace App\Actions\Accounts;

use App\Models\Account;
use Illuminate\Support\Facades\DB;

class UpsertAccountAction
{
    /**
     * Execute the action to create or update an account.
     *
     * @param array{
     *     name: string,
     *     type: \App\Enums\AccountType|string,
     *     parent_id?: int|null,
     *     ledger_id: int,
     *     ui_metadata: array
     * } $data
     */
    public function execute(array $data, ?Account $account = null): Account
    {
        return DB::transaction(function () use ($data, $account) {
            if ($account) {
                $account->update($data);
                return $account->fresh();
            }

            return Account::create($data);
        });
    }
}
