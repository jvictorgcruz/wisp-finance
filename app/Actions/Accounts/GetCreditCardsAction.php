<?php

namespace App\Actions\Accounts;

use App\Models\Account;
use App\Support\LedgerContext;
use Illuminate\Support\Collection;

class GetCreditCardsAction
{
    public function __construct(
        protected GetAccountBalanceAction $getAccountBalanceAction
    ) {}

    /**
     * Execute the action to get all credit cards for the current ledger.
     *
     * @return Collection
     */
    public function execute(): Collection
    {
        $ledgerId = LedgerContext::currentId();

        return Account::with('creditCardDetail')
            ->where('ledger_id', $ledgerId)
            ->where('is_credit_card', true)
            ->get()
            ->map(function (Account $card) {
                return [
                    'id' => $card->id,
                    'name' => $card->name,
                    'type' => $card->type,
                    'status' => $card->status,
                    'parent_id' => $card->parent_id,
                    'parent_Key' => 'credit_card', // Essential for AccountModal to show card fields
                    'is_system' => $card->is_system,
                    'is_credit_card' => true,
                    'ui_metadata' => $card->ui_metadata,
                    'has_history' => $card->has_history,
                    'balance' => $this->getAccountBalanceAction->executeSingle($card),
                    'credit_card_details' => $card->creditCardDetail ? [
                        'limit' => $card->creditCardDetail->limit,
                        'closing_day' => $card->creditCardDetail->closing_day,
                        'due_day' => $card->creditCardDetail->due_day,
                        'invoice_control_enabled' => $card->creditCardDetail->invoice_control_enabled,
                        'current_invoice' => ($invoice = \App\Models\CreditCardInvoice::resolveActiveInvoice($card->creditCardDetail)) ? [
                            'id' => $invoice->id,
                            'total_amount' => $invoice->total_amount,
                            'paid_amount' => $invoice->paid_amount,
                            'status' => $invoice->status,
                            'reference' => $invoice->reference_year_month,
                            'due_date' => $invoice->due_date->toISOString(),
                            'closing_date' => $invoice->closing_date->toISOString(),
                        ] : null,
                    ] : null,
                ];
            });
    }
}
