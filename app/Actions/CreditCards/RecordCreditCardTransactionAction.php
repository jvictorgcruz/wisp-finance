<?php

namespace App\Actions\CreditCards;

use App\Actions\Transactions\BaseFinancialAction;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\ExpectedCashFlow;
use App\Models\Transaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RecordCreditCardTransactionAction extends BaseFinancialAction
{
    /**
     * Record a credit card transaction (Expense or Income/Refund).
     */
    public function execute(
        CreditCardDetail $card,
        Account $categoryAccount,
        float $amount,
        Carbon $date,
        string $description,
        int $installments = 1,
        string $type = 'EXPENSE'
    ): Transaction {
        return DB::transaction(function () use ($card, $categoryAccount, $amount, $date, $description, $installments, $type) {
            // 1. Create Master Transaction
            $transaction = Transaction::create([
                'ledger_id' => $card->account->ledger_id,
                'created_by_user_id' => auth()->id(),
                'date' => $date,
                'description' => $description,
                'type' => $type === 'EXPENSE' ? TransactionType::EXPENSE : TransactionType::INCOME,
                'status' => TransactionStatus::ACTIVE,
            ]);

            // 2. Journal Entries (Accounting)
            if ($type === 'EXPENSE') {
                // DEBIT Category (Expense), CREDIT Card (Liability)
                $this->createEntry($transaction, $categoryAccount->id, 'DEBIT', $amount, $date->toDateString());
                $this->createEntry($transaction, $card->account_id, 'CREDIT', $amount, $date->toDateString());
            } else {
                // INCOME / REFUND
                // DEBIT Card (Liability), CREDIT Category (Revenue/Expense reversal)
                $this->createEntry($transaction, $card->account_id, 'DEBIT', $amount, $date->toDateString());
                $this->createEntry($transaction, $categoryAccount->id, 'CREDIT', $amount, $date->toDateString());
            }

            // 3. Invoice & CashFlow Logic
            if ($card->invoice_control_enabled) {
                $installmentAmount = round($amount / $installments, 2);
                $remainingAmount = $amount;

                for ($i = 0; $i < $installments; $i++) {
                    $currentInstallmentAmount = ($i === $installments - 1) ? $remainingAmount : $installmentAmount;
                    $remainingAmount -= $currentInstallmentAmount;

                    // Calculate installment date (for invoice resolution)
                    $installmentDate = $date->copy()->addMonths($i);
                    $invoice = CreditCardInvoice::resolveForCardAndDate($card, $installmentDate);

                    ExpectedCashFlow::create([
                        'transaction_id' => $transaction->id,
                        'account_id' => $card->account_id,
                        'credit_card_invoice_id' => $invoice->id,
                        'amount' => $currentInstallmentAmount,
                        'due_date' => $invoice->due_date,
                        'description' => $installments > 1 ? "($description) " . ($i + 1) . "/$installments" : $description,
                        'status' => 'PENDING',
                    ]);
                }
            } else {
                // No invoice control -> Direct paid cash flow
                $this->createPaidCashFlow($transaction, $card->account_id, $amount, $date->toDateString(), $description);
            }

            return $transaction;
        });
    }
}
