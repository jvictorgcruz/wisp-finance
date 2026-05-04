<?php

namespace App\Actions\CreditCards;

use App\Actions\Transactions\BaseFinancialAction;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\CreditCardInvoice;
use App\Models\ExpectedCashFlow;
use App\Models\Transaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PayInvoiceAction extends BaseFinancialAction
{
    /**
     * Pay a credit card invoice (full, partial, or overpayment).
     * 
     * @param int $amount Amount in cents
     */
    public function execute(CreditCardInvoice $invoice, Account $sourceAccount, int $amount, Carbon $date): Transaction
    {
        return DB::transaction(function () use ($invoice, $sourceAccount, $amount, $date) {
            $card = $invoice->creditCardDetail;
            $ledgerId = $card->account->ledger_id;

            // 1. Create Payment Transaction
            $transaction = Transaction::create([
                'ledger_id' => $ledgerId,
                'created_by_user_id' => auth()->id(),
                'date' => $date,
                'description' => __('Pagamento de Fatura') . " - " . $invoice->reference_year_month,
                'type' => TransactionType::TRANSFER,
                'status' => TransactionStatus::ACTIVE,
            ]);

            // 2. Journal Entries (Accounting impact)
            // DEBIT Card Account (Liability decreases), CREDIT Source Account (Asset decreases)
            $this->createEntry($transaction, $card->account_id, 'DEBIT', $amount, $date->toDateString());
            $this->createEntry($transaction, $sourceAccount->id, 'CREDIT', $amount, $date->toDateString());

            // 3. Handle Cash Flows
            // For Source: standard "paid" flow (Bank/Cash)
            $this->resolveCashFlows($transaction, $sourceAccount, $amount, $date, $transaction->description);

            // For Destination (Card): PAYMENT flow (Negative ECF)
            // We force the invoice ID to ensure it links to the one we are paying
            $this->resolveCashFlows($transaction, $card->account, $amount, $date, $transaction->description, 1, false, true, $invoice->id);

            return $transaction;
        });
    }
}
