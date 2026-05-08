<?php

namespace App\Actions\Accounts;

use App\Enums\AccountType;
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
     *     ui_metadata: array,
     *     is_credit_card?: bool,
     *     credit_card_details?: array{
     *         limit: int,
     *         closing_day: int,
     *         due_day: int
     *     }
     * } $data
     */
    public function execute(array $data, ?Account $account = null): Account
    {
        return DB::transaction(function () use ($data, $account) {
            $isCreditCard = $data['is_credit_card'] ?? false;

            if ($isCreditCard) {
                $data['type'] = AccountType::LIABILITY;
            }

            $accountData = collect($data)->except(['credit_card_details'])->toArray();

            if ($account) {
                $account->update($accountData);
            } else {
                $account = Account::create($accountData);
            }

            if ($isCreditCard && isset($data['credit_card_details'])) {
                $details = $data['credit_card_details'];

                // Ensure flag exists (default true)
                $details['invoice_control_enabled'] = $details['invoice_control_enabled'] ?? true;

                // If invoice control disabled, explicitely set to null to clear database
                if (! $details['invoice_control_enabled']) {
                    $details['closing_day'] = null;
                    $details['due_day'] = null;
                }

                $account->creditCardDetail()->updateOrCreate(
                    ['account_id' => $account->id],
                    collect($details)->except(['ledger_id'])->toArray()
                );

                // Sync open invoices with new dates
                app(\App\Actions\CreditCards\SyncInvoiceDatesAction::class)->execute($account->creditCardDetail);
            }

            return $account->fresh(['creditCardDetail']);
        });
    }
}
