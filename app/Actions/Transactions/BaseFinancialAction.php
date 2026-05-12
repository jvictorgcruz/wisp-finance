<?php

namespace App\Actions\Transactions;

use App\Exceptions\InconsistentJournalEntryException;
use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Models\ExpectedCashFlow;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

use Illuminate\Support\Carbon;

abstract class BaseFinancialAction
{
    /**
     * Ensure the sum of debits equals the sum of credits.
     *
     * @throws InconsistentJournalEntryException
     */
    protected function validateBalance(Collection $entries): void
    {
        $debitSum = $entries->where('type', 'DEBIT')->sum('amount_raw');
        $creditSum = $entries->where('type', 'CREDIT')->sum('amount_raw');

        if ($debitSum !== $creditSum) {
            throw new InconsistentJournalEntryException($debitSum, $creditSum);
        }
    }

    /**
     * Create a journal entry and return it.
     */
    protected function createEntry(Transaction $transaction, int $accountId, string $type, float|int $amount, string $date): JournalEntry
    {
        return JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $accountId,
            'type' => $type,
            'amount' => $amount,
            'entry_date' => $date,
        ]);
    }

    /**
     * Create a paid cash flow for the transaction.
     */
    protected function createPaidCashFlow(Transaction $transaction, int $accountId, float|int $amount, string $date, ?string $description): ExpectedCashFlow
    {
        return ExpectedCashFlow::create([
            'transaction_id' => $transaction->id,
            'account_id' => $accountId,
            'amount' => $amount,
            'due_date' => $date,
            'description' => $description,
            'status' => 'PAID',
        ]);
    }

    /**
     * Handle cash flow creation, detecting credit cards with invoice control.
     */
    protected function resolveCashFlows(
        Transaction $transaction,
        \App\Models\Account $account,
        float|int $amount,
        Carbon $date,
        ?string $description,
        int $installments = 1,
        bool $isRefund = false
    ): void {
        if ($account->is_credit_card && $account->creditCardDetail?->invoice_control_enabled) {
            $card = $account->creditCardDetail;
            $installmentAmount = round($amount / $installments, 2);
            $remainingAmount = $amount;

            for ($i = 0; $i < $installments; $i++) {
                $currentInstallmentAmount = ($i === $installments - 1) ? $remainingAmount : $installmentAmount;
                $remainingAmount -= $currentInstallmentAmount;

                // For credit cards, refunds (INCOME) must be negative to reduce invoice total
                if ($isRefund) {
                    $currentInstallmentAmount = -$currentInstallmentAmount;
                }

                $installmentDate = $date->copy()->addMonths($i);
                $invoice = \App\Models\CreditCardInvoice::resolveForCardAndDate($card, $installmentDate);

                ExpectedCashFlow::create([
                    'transaction_id' => $transaction->id,
                    'account_id' => $account->id,
                    'credit_card_invoice_id' => $invoice->id,
                    'amount' => $currentInstallmentAmount,
                    'due_date' => $invoice->due_date,
                    'description' => $installments > 1 ? "($description) " . ($i + 1) . "/$installments" : $description,
                    'status' => 'PENDING',
                ]);
            }
        } else {
            $this->createPaidCashFlow($transaction, $account->id, $amount, $date->toDateString(), $description);
        }
    }
}
