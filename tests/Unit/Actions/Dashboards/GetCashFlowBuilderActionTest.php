<?php

namespace Tests\Unit\Actions\Dashboards;

use App\Actions\Dashboards\GetCashFlowBuilderAction;
use App\Models\Account;
use App\Models\ExpectedCashFlow;
use App\Models\Ledger;
use App\Support\LedgerContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $result = createAuthenticatedLedger();
    $this->ledger = $result['ledger'];
    $this->user = $result['user'];

    $this->bankAccount = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::ASSET,
    ]);

    $this->category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => \App\Enums\AccountType::REVENUE,
    ]);

    $this->action = new GetCashFlowBuilderAction();
});

test('it calculates daily cash flow for the last 30 days', function () {
    // Today: +5000
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => 5000,
        'due_date' => Carbon::today(),
        'status' => 'PAID',
    ]);

    // Yesterday: -2000
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => -2000,
        'due_date' => Carbon::yesterday(),
        'status' => 'PAID',
    ]);

    // Multiple entries on same day: -1000 + -500 = -1500
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => -1000,
        'due_date' => Carbon::today()->subDays(2),
        'status' => 'PAID',
    ]);
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => -500,
        'due_date' => Carbon::today()->subDays(2),
        'status' => 'PAID',
    ]);

    // PENDING should be ignored
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => 100000,
        'due_date' => Carbon::today(),
        'status' => 'PENDING',
    ]);

    // Other account types should be ignored (e.g. Liability/Revenue)
    $otherAccount = Account::factory()->create(['ledger_id' => $this->ledger->id, 'type' => \App\Enums\AccountType::LIABILITY]);
    ExpectedCashFlow::factory()->create([
        'account_id' => $otherAccount->id,
        'amount' => 50000,
        'due_date' => Carbon::today(),
        'status' => 'PAID',
    ]);

    $timeline = $this->action->execute();
    
    // Cumulative calculation:
    // Day -2: -1500
    // Yesterday: -1500 + -2000 = -3500
    // Today: -3500 + 5000 = 1500

    expect($timeline)->toBeArray();
    expect($timeline[Carbon::today()->toDateString()])->toBe(1500);
    expect($timeline[Carbon::yesterday()->toDateString()])->toBe(-3500);
    expect($timeline[Carbon::today()->subDays(2)->toDateString()])->toBe(-1500);
    expect(count($timeline))->toBe(31); // 30 days + today
});

test('it caches the results and invalidates when data changes', function () {
    $cacheKey = "ledger_{$this->ledger->id}_cash_flow_30d";

    // First execution caches
    $this->action->execute();
    expect(Cache::has($cacheKey))->toBeTrue();

    $cachedData = Cache::get($cacheKey);
    expect($cachedData[Carbon::today()->toDateString()])->toBe(0);

    // Create new data - should trigger invalidation via Observer
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => 777,
        'due_date' => Carbon::today(),
        'status' => 'PAID',
    ]);

    expect(Cache::has($cacheKey))->toBeFalse();

    // Re-execute
    $newTimeline = $this->action->execute();
    expect($newTimeline[Carbon::today()->toDateString()])->toBe(777);
});
