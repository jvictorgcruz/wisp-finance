<?php

namespace App\Actions\Accounts;

use App\Enums\AccountStatus;
use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteAccountAction
{
    public function __construct(
        protected GetAccountBalanceAction $getBalanceAction
    ) {
    }

    /**
     * Execute the action to delete or inactivate an account.
     *
     * @throws ValidationException
     */
    public function execute(Account $account): bool
    {
        return DB::transaction(function () use ($account) {
            if ($account->is_system) {
                abort(403, __('Cannot delete system-required accounts.'));
            }

            if ($account->children()->exists()) {
                throw ValidationException::withMessages([
                    'id' => __('Cannot delete an account that has sub-accounts.'),
                ]);
            }

            if ($account->journalEntries()->exists()) {
                return $this->handleInactivation($account);
            }

            // No history: allow standard Soft Delete (deleted_at)
            return $account->delete();
        });
    }

    /**
     * Handle inactivation of an account with history.
     */
    protected function handleInactivation(Account $account): bool
    {
        $balance = $this->getBalanceAction->execute($account);

        if ($balance !== 0) {
            throw ValidationException::withMessages([
                'id' => __('Cannot inactivate an account with a non-zero balance (:balance).', [
                    'balance' => number_format($balance / 100, 2),
                ]),
            ]);
        }

        return $account->update([
            'status' => AccountStatus::INACTIVE,
        ]);
    }
}
