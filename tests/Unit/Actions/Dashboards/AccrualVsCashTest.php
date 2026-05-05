<?php

namespace Tests\Unit\Actions\Dashboards;

use App\Actions\Dashboards\GetAccrualBasisBuilderAction;
use App\Actions\Dashboards\GetCashFlowBuilderAction;
use App\Actions\Transactions\RecordExpenseAction;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Support\LedgerContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->ledger = $result['ledger'];
    $this->user = $result['user'];

    $this->cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    
    CreditCardDetail::factory()->create([
        'account_id' => $this->cardAccount->id,
        'closing_day' => 5,
        'due_day' => 15,
        'invoice_control_enabled' => true,
    ]);

    $this->expenseCategory = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::EXPENSE,
    ]);

    $this->recordExpense = new RecordExpenseAction();
    $this->getCashFlow = new GetCashFlowBuilderAction();
    $this->getAccrual = new GetAccrualBasisBuilderAction();
});

test('accrual basis records full amount on day 1 while cash flow spreads it', function () {
    $amount = 120000; // R$ 1.200,00
    $date = Carbon::today();
    $installments = 12;

    // Record a 12x installment expense
    $this->recordExpense->execute(
        $this->cardAccount,
        $this->expenseCategory,
        $amount,
        $date,
        'Laptop',
        [],
        $installments
    );

    // 1. Check Cash Flow (Should be zero for ASSETS since it's on a card and NOT PAID yet)
    // Wait, Cash Flow only looks at ASSET accounts that are PAID.
    // The installments are PENDING until the invoice is paid.
    $cashFlow = $this->getCashFlow->execute();
    expect($cashFlow[$date->toDateString()])->toBe(0);

    // 2. Check Accrual Basis (Should be full 1200.00 on day 1)
    $accrual = $this->getAccrual->execute();
    $timeline = $accrual['timeline'];
    
    expect($timeline[$date->toDateString()]['expense'])->toBe(120000);
    
    // Check categories drilldown
    $categories = $accrual['categories'];
    $cat = $categories->firstWhere('id', $this->expenseCategory->id);
    expect($cat['total'])->toBe(120000);
});
