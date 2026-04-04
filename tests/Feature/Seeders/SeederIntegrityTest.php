<?php

namespace Tests\Feature\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Enums\AccountType;
use App\Actions\Accounts\GetAccountBalanceAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederIntegrityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the seeder creates valid and balanced data.
     * Rule: Only run in development or testing.
     * Rule: Assets and Liabilities should NOT have root-level journal entries.
     */
    public function test_seeder_generates_valid_financial_data(): void
    {
        if (app()->environment('production')) {
            $this->markTestSkipped('Seeder integrity tests should only run in development.');
        }

        // 1. Run the seeders
        $this->seed();

        // 2. Identify the test user
        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $ledger = $user->ledgers()->first();
        $this->assertNotNull($ledger);

        // 3. Verify Hierarchy Rule: Assets and Liabilities roots must not have direct entries
        $rootAccountsWithEntries = Account::where('ledger_id', $ledger->id)
            ->whereNull('parent_id')
            ->whereIn('type', [AccountType::ASSET, AccountType::LIABILITY])
            ->has('journalEntries')
            ->get();

        $this->assertCount(0, $rootAccountsWithEntries, 'Asset/Liability root accounts should not have direct journal entries.');

        // 4. Verify Accounting Balance (Equity = Assets)
        $balanceAction = new GetAccountBalanceAction();
        
        $totalAssets = Account::where('ledger_id', $ledger->id)
            ->where('type', AccountType::ASSET)
            ->whereNull('parent_id')
            ->get()
            ->sum(fn ($a) => $this->calculateNestedBalance($a, $balanceAction));

        $totalEquity = Account::where('ledger_id', $ledger->id)
            ->where('type', AccountType::EQUITY)
            ->whereNull('parent_id')
            ->get()
            ->sum(fn ($a) => $this->calculateNestedBalance($a, $balanceAction));

        // Seeder total should perfectly match 10.000,00 (1.000.000 cents)
        $this->assertEquals(1000000, $totalAssets);
        $this->assertEquals(1000000, $totalEquity);
        $this->assertEquals($totalAssets, $totalEquity);
    }

    /**
     * Helper to calculate balance including children.
     */
    protected function calculateNestedBalance(Account $account, GetAccountBalanceAction $action): int
    {
        $directBalance = $action->execute($account);
        $childrenBalance = $account->children->sum(fn ($child) => $this->calculateNestedBalance($child, $action));
        
        return $directBalance + $childrenBalance;
    }
}
