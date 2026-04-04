<?php

namespace App\Actions\Accounts;

use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteAccountAction
{
    /**
     * Execute the action to delete an account.
     *
     * @throws ValidationException
     */
    public function execute(Account $account): bool
    {
        return DB::transaction(function () use ($account) {
            if ($account->is_system) {
                throw ValidationException::withMessages([
                    'id' => __('Cannot delete system-required accounts.'),
                ]);
            }

            if ($account->children()->exists()) {
                throw ValidationException::withMessages([
                    'id' => __('Cannot delete an account that has sub-accounts.'),
                ]);
            }

            // In the future, check for journal entries here (Task 011/017)

            return $account->delete();
        });
    }
}
