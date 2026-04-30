<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\GetPaginatedTransactionsAction;
use App\Actions\Transactions\RecordExpenseAction;
use App\Actions\Transactions\RecordIncomeAction;
use App\Actions\Transactions\RecordTransferAction;
use App\Http\Requests\TransactionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     */
    public function index(Request $request, GetPaginatedTransactionsAction $action): Response
    {
        $filters = $request->only(['search']);
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
        $sourceAccount = \App\Models\Account::findOrFail($data['source_account_id']);
        $categoryAccount = \App\Models\Account::findOrFail($data['destination_account_id']);

        $action->execute(
            $sourceAccount,
            $categoryAccount,
            $data['amount'],
            \Carbon\Carbon::parse($data['date']),
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
        $categoryAccount = \App\Models\Account::findOrFail($data['source_account_id']);
        $destinationAccount = \App\Models\Account::findOrFail($data['destination_account_id']);

        $action->execute(
            $categoryAccount,
            $destinationAccount,
            $data['amount'],
            \Carbon\Carbon::parse($data['date']),
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
        $sourceAccount = \App\Models\Account::findOrFail($data['source_account_id']);
        $destinationAccount = \App\Models\Account::findOrFail($data['destination_account_id']);

        $action->execute(
            $sourceAccount,
            $destinationAccount,
            $data['amount'],
            \Carbon\Carbon::parse($data['date']),
            $data['description'],
            $data['metadata'] ?? []
        );

        return back()->with('success', __('transactions.modal.success.transfer'));
    }
}
