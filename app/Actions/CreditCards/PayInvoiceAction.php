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
     */
    public function execute(CreditCardInvoice $invoice, Account $sourceAccount, float $amount, Carbon $date): Transaction
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
                'type' => TransactionType::CREDIT_CARD_PAYMENT,
                'status' => TransactionStatus::ACTIVE,
            ]);

            // 2. Journal Entries (Accounting impact)
            // DEBIT Card Account (Liability decreases), CREDIT Source Account (Asset decreases)
            $this->createEntry($transaction, $card->account_id, 'DEBIT', $amount, $date->toDateString());
            $this->createEntry($transaction, $sourceAccount->id, 'CREDIT', $amount, $date->toDateString());

            // 3. Resolve CashFlows (Sequential Liquidation)
            // We look at all pending cash flows for this card, starting with this invoice's items
            $pendingCashFlows = ExpectedCashFlow::query()
                ->where('account_id', $card->account_id)
                ->where('status', 'PENDING')
                ->orderBy('due_date')
                ->orderBy('id')
                ->get();

            $remainingToPay = $amount;

            /** @var \App\Models\ExpectedCashFlow $cf */
            foreach ($pendingCashFlows as $cf) {
                if ($remainingToPay <= 0) break;

                if ($remainingToPay >= $cf->amount) {
                    $cf->status = 'PAID';
                    $cf->save();
                    
                    $remainingToPay -= $cf->amount;
                } else {
                    // Partial payment of this specific item -> SPLIT it
                    $paidPart = $remainingToPay;
                    $pendingPart = ($cf->amount - $paidPart);

                    $cf->setAttribute('amount', $paidPart);
                    $cf->status = 'PAID';
                    $cf->save();

                    $cf->replicate()->fill([
                        'amount' => $pendingPart,
                        'status' => 'PENDING',
                    ])->save();

                    $remainingToPay = 0;
                }
            }

            // 4. Handle Overpayment (Credit)
            if ($remainingToPay > 0) {
                // If there's money left after paying ALL pending items, create a credit entry in the current invoice
                ExpectedCashFlow::create([
                    'transaction_id' => $transaction->id,
                    'account_id' => $card->account_id,
                    'credit_card_invoice_id' => $invoice->id,
                    'amount' => -$remainingToPay, // Negative amount = credit
                    'due_date' => $invoice->due_date,
                    'description' => __('Crédito de Pagamento a Maior'),
                    'status' => 'PAID',
                ]);
            }

            return $transaction;
        });
    }
}
