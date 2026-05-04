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
        // We use amount directly as it is now always cents (int)
        $debitSum = (int) $entries->where('type', 'DEBIT')->sum('amount');
        $creditSum = (int) $entries->where('type', 'CREDIT')->sum('amount');

        if ($debitSum !== $creditSum) {
            throw new InconsistentJournalEntryException($debitSum, $creditSum);
        }
    }

    /**
     * Create a journal entry and return it.
     * @param int $amount Amount in cents
     */
    protected function createEntry(Transaction $transaction, int $accountId, string $type, int $amount, string $date): JournalEntry
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
     * @param int $amount Amount in cents
     */
    protected function createPaidCashFlow(Transaction $transaction, int $accountId, int $amount, string $date, ?string $description): ExpectedCashFlow
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
     * @param int $amount Amount in cents
     */
    protected function resolveCashFlows(
        Transaction $transaction,
        \App\Models\Account $account,
        int $amount,
        Carbon $date,
        ?string $description,
        int $installments = 1,
        bool $isRefund = false,
        bool $isPayment = false,
        ?int $forceInvoiceId = null
    ): void {
        if ($account->is_credit_card && $account->creditCardDetail?->invoice_control_enabled) {
            $card = $account->creditCardDetail;
            
            // Integer division for installments
            $installmentAmount = (int) floor($amount / $installments);
            $remainingAmount = $amount;

            for ($i = 0; $i < $installments; $i++) {
                $currentInstallmentAmount = ($i === $installments - 1) ? $remainingAmount : $installmentAmount;
                $remainingAmount -= $currentInstallmentAmount;

                // For credit cards:
                // - Refunds (isRefund) reduce the invoice total (Negative ECF)
                // - Payments (isPayment) reduce the invoice total (Negative ECF)
                // - Regular purchases (EXPENSE) increase the invoice total (Positive ECF)
                if ($isRefund || $isPayment) {
                    $currentInstallmentAmount = -$currentInstallmentAmount;
                }

                $installmentDate = $date->copy()->addMonths($i);
                $invoiceId = $forceInvoiceId;
                
                if (!$invoiceId) {
                    $invoice = \App\Models\CreditCardInvoice::resolveForCardAndDate($card, $installmentDate);
                    $invoiceId = $invoice->id;
                }

                ExpectedCashFlow::create([
                    'transaction_id' => $transaction->id,
                    'account_id' => $account->id,
                    'credit_card_invoice_id' => $invoiceId,
                    'amount' => $currentInstallmentAmount,
                    'due_date' => $isPayment ? $date : $installmentDate,
                    'description' => $installments > 1 ? "($description) " . ($i + 1) . "/$installments" : $description,
                    'status' => $isPayment ? 'PAID' : 'PENDING',
                ]);
            }
        } else {
            $this->createPaidCashFlow($transaction, $account->id, $amount, $date->toDateString(), $description);
        }
    }
}
