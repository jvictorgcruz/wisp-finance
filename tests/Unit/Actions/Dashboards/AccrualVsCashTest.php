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

    // 1. Check Cash Flow
    $cashFlowData = $this->getCashFlow->execute();
    $cashFlow = $cashFlowData['timeline'];
    expect($cashFlow)->toHaveKey($date->toDateString());

    // 2. Check Accrual Basis (Should be full 1200.00 on day 1)
    $accrual = $this->getAccrual->execute();
    $timeline = $accrual['timeline'];
    
    expect($timeline[$date->toDateString()]['expense'])->toBe(120000);
    
    // Check categories drilldown
    $categories = $accrual['categories'];
    $cat = $categories->firstWhere('id', $this->expenseCategory->id);
    expect($cat['total'])->toBe(120000);
});

test('it reflects 200 in 2x credit purchase: 200 in current month accrual and 100 in each of next 2 months cash', function () {
    // Current date: 10th of current month
    $now = Carbon::create(2026, 5, 10);
    Carbon::setTestNow($now);

    // Card with closing day 15 and due day 25
    $cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    CreditCardDetail::factory()->create([
        'account_id' => $cardAccount->id,
        'closing_day' => 15,
        'due_day' => 25,
        'invoice_control_enabled' => true,
    ]);

    $summaryAction = app(\App\Actions\Dashboards\GetDashboardSummaryAction::class);

    // Purchase: 200 in 2x (100 each)
    $this->recordExpense->execute(
        $cardAccount,
        $this->expenseCategory,
        20000,
        $now,
        'Test Purchase 2x',
        [],
        2
    );

    // Month 1 (May 2026): Purchase made May 10, closing May 15, due May 25
    $maySummary = $summaryAction->execute(5, 2026);
    expect($maySummary['accrual']['expense'])->toBe(20000);
    expect($maySummary['cash']['expense'])->toBe(10000);

    // Month 2 (June 2026)
    $juneSummary = $summaryAction->execute(6, 2026);
    expect($juneSummary['accrual']['expense'])->toBe(0);
    expect($juneSummary['cash']['expense'])->toBe(10000);

    // Month 3 (July 2026)
    $julySummary = $summaryAction->execute(7, 2026);
    expect($julySummary['accrual']['expense'])->toBe(0);
    expect($julySummary['cash']['expense'])->toBe(0);

    Carbon::setTestNow();
});

test('it assigns installments to future months when purchase is after closing date', function () {
    // Current date: 20th of October 2026
    $now = Carbon::create(2026, 10, 20);
    Carbon::setTestNow($now);

    // Card with closing day 10 and due day 17
    $cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    $cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $cardAccount->id,
        'closing_day' => 10,
        'due_day' => 17,
        'invoice_control_enabled' => true,
    ]);

    $summaryAction = app(\App\Actions\Dashboards\GetDashboardSummaryAction::class);

    // Purchase 200 in 2x made on Oct 20 (after closing on Oct 10)
    $this->recordExpense->execute(
        $cardAccount,
        $this->expenseCategory,
        20000,
        $now,
        'Purchase After Closing',
        [],
        2
    );

    // Month 1 (October 2026):
    // Accrual has the full expense (200.00).
    // Cash has 0.00 because invoice 1 is November (due Nov 17) and invoice 2 is December (due Dec 17).
    $octSummary = $summaryAction->execute(10, 2026);
    expect($octSummary['accrual']['expense'])->toBe(20000);
    expect($octSummary['cash']['expense'])->toBe(0);

    // Month 2 (November 2026):
    // Accrual: 0.00
    // Cash: 100.00 (First installment due Nov 17)
    $novSummary = $summaryAction->execute(11, 2026);
    expect($novSummary['accrual']['expense'])->toBe(0);
    expect($novSummary['cash']['expense'])->toBe(10000);

    // Month 3 (December 2026):
    // Accrual: 0.00
    // Cash: 100.00 (Second installment due Dec 17)
    $decSummary = $summaryAction->execute(12, 2026);
    expect($decSummary['accrual']['expense'])->toBe(0);
    expect($decSummary['cash']['expense'])->toBe(10000);

    // Timeline check: in November, starting balance must not be reduced prematurely by October
    $cfBuilder = app(GetCashFlowBuilderAction::class);
    $novTimeline = $cfBuilder->execute(11, 2026)['timeline'];
    
    // Nov 01 to Nov 16 should have 0 (or previous balance), and drop by 100 on Nov 17
    expect($novTimeline['2026-11-16'])->toBe(0);
    expect($novTimeline['2026-11-17'])->toBe(-10000);

    // Sync invoice dates test: change due day from 17 to 25
    $cardDetail->update(['due_day' => 25]);
    app(\App\Actions\CreditCards\SyncInvoiceDatesAction::class)->execute($cardDetail);

    // ECF due_date should now be synced to Nov 25 and Dec 25
    $ecfs = \App\Models\ExpectedCashFlow::where('account_id', $cardAccount->id)->orderBy('id')->get();
    expect(Carbon::parse($ecfs[0]->due_date)->format('Y-m-d'))->toBe('2026-11-25');
    expect(Carbon::parse($ecfs[1]->due_date)->format('Y-m-d'))->toBe('2026-12-25');

    Carbon::setTestNow();
});
