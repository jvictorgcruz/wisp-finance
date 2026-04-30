<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\RecordExpenseAction;
use App\Actions\Transactions\RecordIncomeAction;
use App\Actions\Transactions\RecordTransferAction;
use App\Http\Requests\TransactionRequest;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;

class TransactionController extends Controller
{
    /**
     * Store a new expense.
     */
    public function storeExpense(TransactionRequest $request, RecordExpenseAction $action): RedirectResponse
    {
        $source = Account::findOrFail($request->source_account_id);
        $category = Account::findOrFail($request->destination_account_id);

        $action->execute(
            $source,
            $category,
            $request->amount / 100, // Action expects float/raw which is then casted, but let's be consistent
            Carbon::parse($request->date),
            $request->description,
            $request->metadata ?? []
        );

        return redirect()->back()->with('success', __('transactions.modal.success.expense'));
    }

    /**
     * Store a new income.
     */
    public function storeIncome(TransactionRequest $request, RecordIncomeAction $action): RedirectResponse
    {
        $category = Account::findOrFail($request->source_account_id);
        $destination = Account::findOrFail($request->destination_account_id);

        $action->execute(
            $category,
            $destination,
            $request->amount / 100,
            Carbon::parse($request->date),
            $request->description,
            $request->metadata ?? []
        );

        return redirect()->back()->with('success', __('transactions.modal.success.income'));
    }

    /**
     * Store a new transfer.
     */
    public function storeTransfer(TransactionRequest $request, RecordTransferAction $action): RedirectResponse
    {
        $source = Account::findOrFail($request->source_account_id);
        $destination = Account::findOrFail($request->destination_account_id);

        $action->execute(
            $source,
            $destination,
            $request->amount / 100,
            Carbon::parse($request->date),
            $request->description,
            $request->metadata ?? []
        );

        return redirect()->back()->with('success', __('transactions.modal.success.transfer'));
    }
}
