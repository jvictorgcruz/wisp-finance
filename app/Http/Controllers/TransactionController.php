<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\GetPaginatedTransactionsAction;
use App\Actions\Transactions\RecordExpenseAction;
use App\Actions\Transactions\RecordIncomeAction;
use App\Actions\Transactions\RecordTransferAction;
use App\Actions\Transactions\VoidTransactionAction;
use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Models\Account;
use App\Enums\TransactionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request, GetPaginatedTransactionsAction $action): Response
    {
        $filters = $request->only(['search', 'date_from', 'date_to', 'account_id', 'category_id']);
        
        // Default to current month if dates are not provided
        if (empty($filters['date_from'])) {
            $filters['date_from'] = now()->startOfMonth()->toDateString();
        }
        if (empty($filters['date_to'])) {
            $filters['date_to'] = now()->endOfMonth()->toDateString();
        }

        $transactions = $action->execute(20, $filters);
        
        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a new expense transaction.
     */
    public function storeExpense(TransactionRequest $request, RecordExpenseAction $action): RedirectResponse
    {
        $data = $request->validated();
        $sourceAccount = Account::findOrFail($data['source_account_id']);
        $categoryAccount = Account::findOrFail($data['destination_account_id']);

        $action->execute(
            $sourceAccount,
            $categoryAccount,
            $data['amount'],
            Carbon::parse($data['date']),
            $data['description'],
            $data['metadata'] ?? []
        );

        return back()->with('success', __('transactions.modal.success.expense'));
    }

    /**
     * Store a new income transaction.
     */
    public function storeIncome(TransactionRequest $request, RecordIncomeAction $action): RedirectResponse
    {
        $data = $request->validated();
        $categoryAccount = Account::findOrFail($data['source_account_id']);
        $destinationAccount = Account::findOrFail($data['destination_account_id']);

        $action->execute(
            $categoryAccount,
            $destinationAccount,
            $data['amount'],
            Carbon::parse($data['date']),
            $data['description'],
            $data['metadata'] ?? []
        );

        return back()->with('success', __('transactions.modal.success.income'));
    }

    /**
     * Store a new transfer transaction.
     */
    public function storeTransfer(TransactionRequest $request, RecordTransferAction $action): RedirectResponse
    {
        $data = $request->validated();
        $sourceAccount = Account::findOrFail($data['source_account_id']);
        $destinationAccount = Account::findOrFail($data['destination_account_id']);

        $action->execute(
            $sourceAccount,
            $destinationAccount,
            $data['amount'],
            Carbon::parse($data['date']),
            $data['description'],
            $data['metadata'] ?? []
        );

        return back()->with('success', __('transactions.modal.success.transfer'));
    }

    /**
     * Update an existing transaction (Void + Create new).
     */
    public function update(
        Transaction $transaction, 
        TransactionRequest $request, 
        VoidTransactionAction $voidAction,
        RecordExpenseAction $expenseAction,
        RecordIncomeAction $incomeAction,
        RecordTransferAction $transferAction
    ): RedirectResponse {
        $data = $request->validated();
        
        if ($transaction->reverses_id || $transaction->reversed_by_id) {
            return back()->withErrors(['message' => __('Transactions that are reversed or reversals cannot be edited.')]);
        }

        DB::transaction(function () use ($transaction, $data, $voidAction, $expenseAction, $incomeAction, $transferAction) {
            // 1. Void the old one
            $voidAction->execute($transaction);

            // 2. Create the new one based on the same type
            $date = Carbon::parse($data['date']);
            
            match ($transaction->type) {
                TransactionType::EXPENSE => $expenseAction->execute(
                    Account::findOrFail($data['source_account_id']),
                    Account::findOrFail($data['destination_account_id']),
                    $data['amount'],
                    $date,
                    $data['description'],
                    $data['metadata'] ?? []
                ),
                TransactionType::INCOME => $incomeAction->execute(
                    Account::findOrFail($data['source_account_id']),
                    Account::findOrFail($data['destination_account_id']),
                    $data['amount'],
                    $date,
                    $data['description'],
                    $data['metadata'] ?? []
                ),
                TransactionType::TRANSFER, TransactionType::CREDIT_CARD_PAYMENT => $transferAction->execute(
                    Account::findOrFail($data['source_account_id']),
                    Account::findOrFail($data['destination_account_id']),
                    $data['amount'],
                    $date,
                    $data['description'],
                    $data['metadata'] ?? []
                ),
                default => throw new \RuntimeException("Unsupported transaction type for update."),
            };
        });

        return back()->with('success', __('transactions.modal.success.updated'));
    }

    /**
     * Remove a transaction (Void).
     */
    public function destroy(Transaction $transaction, VoidTransactionAction $action): RedirectResponse
    {
        if ($transaction->reverses_id || $transaction->reversed_by_id) {
            return back()->withErrors(['message' => __('Transactions that are reversed or reversals cannot be deleted.')]);
        }

        $action->execute($transaction);

        return back()->with('success', __('transactions.modal.success.deleted'));
    }
}
