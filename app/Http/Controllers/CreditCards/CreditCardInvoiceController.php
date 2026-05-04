<?php

namespace App\Http\Controllers\CreditCards;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Http\Requests\CreditCards\PayInvoiceRequest;
use App\Actions\CreditCards\PayInvoiceAction;
use App\Models\CreditCardInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class CreditCardInvoiceController extends Controller
{
    /**
     * Show the invoice manager for a specific card and month.
     */
    public function show(Account $account, ?string $yearMonth = null)
    {
        // 1. UI Guard: Ensure it's a credit card with invoice control
        if (! $account->is_credit_card || ! $account->creditCardDetail?->invoice_control_enabled) {
            return redirect()->route('accounts.index')
                ->with('warning', __('credit_cards.invoices.not_enabled'));
        }

        // 2. Resolve the target invoice
        $yearMonth = $yearMonth ?: Carbon::now()->format('Y-m');
        
        $invoice = $account->creditCardDetail->invoices()
            ->where('reference_year_month', $yearMonth)
            ->first();

        // If invoice doesn't exist yet for this month, we try to resolve it (create if needed)
        if (! $invoice) {
            $date = Carbon::parse($yearMonth . '-01');
            $invoice = CreditCardInvoice::resolveForCardAndDate($account->creditCardDetail, $date);
        }

        // 3. Collect all available months for the timeline
        $availableMonths = $account->creditCardDetail->invoices()
            ->orderBy('reference_year_month', 'desc')
            ->pluck('reference_year_month');

        // 4. Load relations for the view
        $invoice->load(['expectedCashFlows' => function ($query) {
            $query->with('transaction')->orderBy('due_date')->orderBy('id');
        }]);

        $balanceAction = app(\App\Actions\Accounts\GetAccountBalanceAction::class);
        $balance = $balanceAction->executeSingle($account);

        $sourceAccounts = Account::where('ledger_id', $account->ledger_id)
            ->where('type', \App\Enums\AccountType::ASSET)
            ->whereNotNull('parent_id')
            ->with('parent')
            ->orderBy('name')
            ->get();

        $activeInvoice = CreditCardInvoice::resolveActiveInvoice($account->creditCardDetail);

        return Inertia::render('CreditCards/Invoices/Index', [
            'account' => array_merge($account->load('creditCardDetail')->toArray(), [
                'balance' => $balance
            ]),
            'invoice' => $invoice,
            'availableMonths' => $availableMonths,
            'currentYearMonth' => $yearMonth,
            'activeYearMonth' => $activeInvoice->reference_year_month,
            'sourceAccounts' => $sourceAccounts,
        ]);
    }

    /**
     * Process an invoice payment.
     */
    public function pay(PayInvoiceRequest $request, Account $account, CreditCardInvoice $invoice, PayInvoiceAction $action)
    {
        // Security check: ensure invoice belongs to this account
        if ($invoice->credit_card_detail_id !== $account->creditCardDetail->id) {
            abort(403);
        }

        $sourceAccount = Account::findOrFail($request->source_account_id);
        $amountCents = (int) $request->amount;
        $date = Carbon::parse($request->date);

        $action->execute($invoice, $sourceAccount, $amountCents, $date);

        return redirect()->back()
            ->with('success', __('credit_cards.invoices.payment_success'));
    }
}
