<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $result = createAuthenticatedLedger();
    $this->user = $result['user'];
    $this->ledger = $result['ledger'];

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);

    $this->cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'invoice_control_enabled' => true,
    ]);
});

test('it renders the invoice index page', function () {
    $invoice = CreditCardInvoice::factory()->create([
        'credit_card_detail_id' => $this->cardDetail->id,
        'reference_year_month' => now()->format('Y-m'),
    ]);

    $response = $this->get(route('accounts.invoices.show', $this->cardAccount));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('CreditCards/Invoices/Index')
        ->has('account')
        ->has('invoice')
        ->has('availableMonths')
    );
});

test('it redirects if invoice control is disabled', function () {
    $this->cardDetail->update(['invoice_control_enabled' => false]);

    $response = $this->get(route('accounts.invoices.show', $this->cardAccount));

    $response->assertRedirect(route('accounts.index'));
});

test('it cannot access invoices from other ledgers', function () {
    $otherLedger = \App\Models\Ledger::factory()->create();
    
    $otherAccount = Account::factory()->create([
        'ledger_id' => $otherLedger->id,
        'is_credit_card' => true,
    ]);
    CreditCardDetail::factory()->create([
        'account_id' => $otherAccount->id,
        'invoice_control_enabled' => true,
    ]);

    // Trying to access other ledger's card invoice
    $response = $this->get(route('accounts.invoices.show', $otherAccount));

    $response->assertStatus(404);
});
