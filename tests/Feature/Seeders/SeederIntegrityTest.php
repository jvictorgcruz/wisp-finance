<?php

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

/**
 * Helper to recursively calculate account balance including children.
 */
function calculateNestedBalance(Account $account, GetAccountBalanceAction $action): int
{
    $directBalance = $action->executeSingle($account);
    $childrenBalance = $account->children->sum(
        fn ($child) => calculateNestedBalance($child, $action)
    );

    return $directBalance + $childrenBalance;
}

test('seeder generates valid financial data', function () {
    /** @var TestCase $this */
    if (app()->environment('production')) {
        $this->markTestSkipped('Seeder integrity tests should only run in development.');
    }

    // Run the seeders
    $this->seed();

    // Identify the test user
    $user = User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();

    $ledger = $user->ledgers()->first();
    expect($ledger)->not->toBeNull();
    session(['current_ledger_id' => $ledger->id]);
    $user->update(['current_ledger_id' => $ledger->id]);
    Auth::login($user);

    // Verify Hierarchy Rule: Assets and Liabilities roots must not have direct entries
    $rootAccountsWithEntries = Account::where('ledger_id', $ledger->id)
        ->whereNull('parent_id')
        ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
        ->has('journalEntries')
        ->get();

    expect($rootAccountsWithEntries)->toHaveCount(0,
        'Asset/Liability root accounts should not have direct journal entries.'
    );

    // Verify Accounting Balance (Equity = Assets)
    $balanceAction = new GetAccountBalanceAction();

    $totalAssets = Account::where('ledger_id', $ledger->id)
        ->where('type', AccountType::ASSET)
        ->whereNull('parent_id')
        ->get()
        ->sum(fn (Account $a) => calculateNestedBalance($a, $balanceAction));

    $totalEquity = Account::where('ledger_id', $ledger->id)
        ->where('type', AccountType::EQUITY)
        ->whereNull('parent_id')
        ->get()
        ->sum(fn (Account $a) => calculateNestedBalance($a, $balanceAction));

    // Seeder total should perfectly match R$ 10.000,00 (1.000.000 cents)
    expect($totalAssets)->toBe(1000000);
    expect($totalEquity)->toBe(1000000);
    expect($totalAssets)->toBe($totalEquity);
});
