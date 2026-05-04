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
    protected function createPaidCashFlow(Transaction $transaction, int $accountId, int $amount, string $date): ExpectedCashFlow
    {
        return ExpectedCashFlow::create([
            'transaction_id' => $transaction->id,
            'account_id' => $accountId,
            'amount' => $amount,
            'due_date' => $date,
            'status' => 'PAID',
        ]);
    }

    /**
     * Handle cash flow creation, detecting credit cards with invoice control.
     * @param int $amount Signed amount (positive for inflow, negative for outflow)
     */
    protected function resolveCashFlows(
        Transaction $transaction,
        \App\Models\Account $account,
        int $amount,
        Carbon $date,
        ?string $description,
        int $installments = 1,
        bool $forcePaid = false,
        ?int $forceInvoiceId = null
    ): void {
        if ($account->is_credit_card && $account->creditCardDetail?->invoice_control_enabled) {
            $card = $account->creditCardDetail;
            
            // Integer division for installments
            $installmentAmount = (int) floor(abs($amount) / $installments);
            $remainingAmount = abs($amount);

            for ($i = 0; $i < $installments; $i++) {
                $currentInstallmentAmount = ($i === $installments - 1) ? $remainingAmount : $installmentAmount;
                $remainingAmount -= $currentInstallmentAmount;

                // Apply original sign to the installment
                if ($amount < 0) {
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
                    'due_date' => $forcePaid ? $date : $installmentDate,
                    'installment_number' => $installments > 1 ? ($i + 1) : null,
                    'installment_total' => $installments > 1 ? $installments : null,
                    'status' => $forcePaid ? 'PAID' : 'PENDING',
                ]);
            }
        } else {
            $this->createPaidCashFlow($transaction, $account->id, $amount, $date->toDateString());
        }
    }
}
