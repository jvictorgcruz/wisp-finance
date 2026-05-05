<?php

namespace Tests\Unit\Models;

use App\Models\ExpectedCashFlow;
use App\Models\Ledger;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('expected cash flow stores amounts as bigint and returns cents (int)', function () {
    $ledger = Ledger::factory()->create();
    $account = Account::factory()->create(['ledger_id' => $ledger->id]);

    $cashFlow = ExpectedCashFlow::create([
        'account_id' => $account->id,
        'amount' => 50075,
        'due_date' => now()->addDays(30),
        'description' => 'Upcoming bill',
        'status' => 'PENDING',
    ]);

    // Check DB storage (cents)
    expect(DB::table('expected_cash_flows')->where('id', $cashFlow->id)->value('amount'))->toBe(50075);

    expect($cashFlow->fresh()->amount)->toBe(50075);
});
