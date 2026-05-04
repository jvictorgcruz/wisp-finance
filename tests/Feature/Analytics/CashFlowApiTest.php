<?php

use App\Models\Account;
use App\Models\ExpectedCashFlow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
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
});

test('authenticated user can access cash flow analytics', function () {
    /** @var TestCase $this */
    ExpectedCashFlow::factory()->create([
        'account_id' => $this->bankAccount->id,
        'amount' => 5000,
        'due_date' => Carbon::today(),
        'status' => 'PAID',
    ]);

    $response = $this->getJson(route('analytics.cash-flow'));

    $response->assertStatus(200)
        ->assertJsonStructure([
            Carbon::today()->toDateString(),
        ]);
        
    expect($response->json(Carbon::today()->toDateString()))->toBe(5000);
});

test('guest cannot access analytics', function () {
    /** @var TestCase $this */
    Auth::logout();
    
    $response = $this->getJson(route('analytics.cash-flow'));
    $response->assertStatus(401);
});
