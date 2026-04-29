<?php

namespace App\Http\Controllers;

use App\Actions\Accounts\DeleteAccountAction;
use App\Actions\Accounts\UpsertAccountAction;
use App\Http\Requests\AccountRequest;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Display a listing of the accounts.
     */
    public function index(\App\Actions\Accounts\GetAccountTreeAction $action): Response
    {
        return Inertia::render('Accounts/Index', $action->execute());
    }

    /**
     * Store a newly created account in storage.
     */
    public function store(AccountRequest $request, UpsertAccountAction $action): RedirectResponse
    {
        $action->execute(array_merge($request->validated(), [
            'ledger_id' => \App\Support\LedgerContext::currentId(),
        ]));

        return redirect()->route('accounts.index')
            ->with('success', __('Account created successfully.'));
    }

    /**
     * Update the specified account in storage.
     */
    public function update(AccountRequest $request, Account $account, UpsertAccountAction $action): RedirectResponse
    {
        $action->execute($request->validated(), $account);

        return redirect()->route('accounts.index')
            ->with('success', __('Account updated successfully.'));
    }

    /**
     * Remove the specified account from storage.
     */
    public function destroy(Account $account, DeleteAccountAction $action): RedirectResponse
    {
        $action->execute($account);

        $message = $account->exists 
            ? __('accounts.messages.inactivate_success') 
            : __('accounts.messages.delete_success');

        return redirect()->route('accounts.index')
            ->with('success', $message);
    }
}
