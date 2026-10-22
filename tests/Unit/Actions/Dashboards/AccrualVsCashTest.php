<?php

namespace Tests\Unit\Actions\Dashboards;

use App\Actions\CreditCards\PayInvoiceAction;
use App\Actions\Dashboards\GetAccrualBasisBuilderAction;
use App\Actions\Dashboards\GetCashFlowBuilderAction;
use App\Actions\Transactions\RecordExpenseAction;
use App\Actions\Transactions\RecordIncomeAction;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\CreditCardInvoice;
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
        'type' => AccountType::LIABILITY,
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
        'type' => AccountType::EXPENSE,
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
        'type' => AccountType::LIABILITY,
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
        'type' => AccountType::LIABILITY,
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

test('it handles credit card invoice prepayment in cash flow dashboard and builder correctly', function () {
    // Current date: October 2026
    $octStart = Carbon::create(2026, 10, 1);
    Carbon::setTestNow($octStart);

    // 1. Bank Account (Asset) with 1,000.00 income
    $bankAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::ASSET,
    ]);

    $revenueCategory = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::REVENUE,
    ]);

    app(RecordIncomeAction::class)->execute(
        $revenueCategory,
        $bankAccount,
        100000, // R$ 1.000,00
        $octStart,
        'Salário Outubro'
    );

    // 2. Card Account with closing day 10, due day 17
    $cardAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::LIABILITY,
        'is_credit_card' => true,
    ]);
    $cardDetail = CreditCardDetail::factory()->create([
        'account_id' => $cardAccount->id,
        'closing_day' => 10,
        'due_day' => 17,
        'invoice_control_enabled' => true,
    ]);

    // 3. Purchase on Oct 20 (after closing day 10) of R$ 300 in 2x (150 each)
    $oct20 = Carbon::create(2026, 10, 20);
    Carbon::setTestNow($oct20);

    $this->recordExpense->execute(
        $cardAccount,
        $this->expenseCategory,
        30000, // R$ 300,00
        $oct20,
        'Compra parcelada 2x',
        [],
        2
    );

    // Resolve the November invoice (Installment 1 is for Nov, due Nov 17)
    $novInvoice = CreditCardInvoice::where('credit_card_detail_id', $cardDetail->id)
        ->where('reference_year_month', '2026-11')
        ->first();
    expect($novInvoice)->not->toBeNull();
    expect($novInvoice->total_amount)->toBe(15000);

    // 4. On Oct 22, user prepays the November invoice in full (R$ 150,00) from Bank
    $oct22 = Carbon::create(2026, 10, 22);
    Carbon::setTestNow($oct22);

    app(PayInvoiceAction::class)->execute(
        $novInvoice,
        $bankAccount,
        15000,
        $oct22
    );

    expect($novInvoice->fresh()->isPaid())->toBeTrue();

    $summaryAction = app(\App\Actions\Dashboards\GetDashboardSummaryAction::class);
    $cfBuilder = app(GetCashFlowBuilderAction::class);

    // 5. Check October 2026 Dashboard Summary:
    // Cash Revenue: 1,000.00 (100000)
    // Cash Expense: 150.00 (15000) from the prepaid invoice
    // Cash Balance: +850.00 (85000)
    // Starting Balance: 0
    // Closing Balance: 850.00 (85000)
    $octSummary = $summaryAction->execute(10, 2026);
    expect($octSummary['cash']['revenue'])->toBe(100000);
    expect($octSummary['cash']['expense'])->toBe(15000);
    expect($octSummary['cash']['balance'])->toBe(85000);
    expect($octSummary['cash']['initial_balance'])->toBe(0);
    expect($octSummary['cash']['closing_balance'])->toBe(85000);

    // October Cash Flow Timeline & Categories
    $octCf = $cfBuilder->execute(10, 2026);
    expect($octCf['timeline']['2026-10-31'])->toBe(85000);
    // Categories in October include the expense category of the prepaid card invoice (150.00)
    $octExpenseCat = collect($octCf['categories'])->firstWhere('id', $this->expenseCategory->id);
    expect($octExpenseCat)->not->toBeNull();
    expect($octExpenseCat['total'])->toBe(15000);

    // 6. Check November 2026 Dashboard Summary:
    // Cash Revenue: 0
    // Cash Expense: 0 (the 150 was already paid in Oct, so NO duplicate deduction!)
    // Starting Balance: 850.00 (85000)
    // Closing Balance: 850.00 (85000)
    $novSummary = $summaryAction->execute(11, 2026);
    expect($novSummary['cash']['revenue'])->toBe(0);
    expect($novSummary['cash']['expense'])->toBe(0);
    expect($novSummary['cash']['initial_balance'])->toBe(85000);
    expect($novSummary['cash']['closing_balance'])->toBe(85000);

    // November Cash Flow Timeline & Categories
    $novCf = $cfBuilder->execute(11, 2026);
    expect($novCf['timeline']['2026-11-30'])->toBe(85000);
    // Categories in November should NOT have the prepaid expense
    $novExpenseCat = collect($novCf['categories'])->firstWhere('id', $this->expenseCategory->id);
    expect($novExpenseCat)->toBeNull();

    // 7. Check December 2026 Dashboard Summary:
    // Cash Expense: 150.00 (Installment 2, unpaid)
    // Starting Balance: 850.00 (85000)
    // Closing Balance: 700.00 (70000)
    $decSummary = $summaryAction->execute(12, 2026);
    expect($decSummary['cash']['expense'])->toBe(15000);
    expect($decSummary['cash']['initial_balance'])->toBe(85000);
    expect($decSummary['cash']['closing_balance'])->toBe(70000);

    Carbon::setTestNow();
});
