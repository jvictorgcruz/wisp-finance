<?php

namespace Tests\Unit\Models;

use App\Models\ExpectedCashFlow;
use App\Models\Ledger;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpectedCashFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_expected_cash_flow_stores_amounts_as_bigint_but_returns_float()
    {
        $ledger = Ledger::factory()->create();
        $account = Account::factory()->create(['ledger_id' => $ledger->id]);

        $cashFlow = ExpectedCashFlow::create([
            'account_id' => $account->id,
            'amount' => 500.75,
            'due_date' => now()->addDays(30),
            'description' => 'Upcoming bill',
            'status' => 'PENDING',
        ]);

        // Check DB storage (cents)
        $this->assertEquals(50075, \DB::table('expected_cash_flows')->where('id', $cashFlow->id)->value('amount'));

        // Check model retrieval (float)
        $this->assertEquals(500.75, $cashFlow->fresh()->amount);
    }
}
