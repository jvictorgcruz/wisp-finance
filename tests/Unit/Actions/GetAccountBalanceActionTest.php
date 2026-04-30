<?php

namespace Tests\Unit\Actions;

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GetAccountBalanceActionTest extends TestCase
{
    use RefreshDatabase;

    public $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new GetAccountBalanceAction();
    }

    public function test_it_calculates_asset_balance_correctly()
    {
        $ledger = Ledger::factory()->create();
        $account = Account::factory()->create([
            'ledger_id' => $ledger->id,
            'type' => AccountType::ASSET
        ]);

        $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);

        // Deposit 100 (Debit)
        JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $account->id,
            'type' => 'DEBIT',
            'amount' => 100,
            'entry_date' => now()
        ]);

        // Withdrawal 40 (Credit)
        JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $account->id,
            'type' => 'CREDIT',
            'amount' => 40,
            'entry_date' => now()
        ]);

        // Asset Balance: Debit - Credit = 100 - 40 = 60
        $balances = $this->action->execute([$account->id]);
        $this->assertEquals(60, $balances->get($account->id));
    }

    public function test_it_calculates_liability_balance_correctly()
    {
        $ledger = Ledger::factory()->create();
        $account = Account::factory()->create([
            'ledger_id' => $ledger->id,
            'type' => AccountType::LIABILITY
        ]);

        $transaction = Transaction::factory()->create(['ledger_id' => $ledger->id]);

        // Loan 1000 (Credit)
        JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $account->id,
            'type' => 'CREDIT',
            'amount' => 1000,
            'entry_date' => now()
        ]);

        // Payment 200 (Debit)
        JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $account->id,
            'type' => 'DEBIT',
            'amount' => 200,
            'entry_date' => now()
        ]);

        // Liability Balance: Credit - Debit = 1000 - 200 = 800
        $balances = $this->action->execute([$account->id]);
        $this->assertEquals(800, $balances->get($account->id));
    }

    public function test_it_isolates_balances_by_ledger()
    {
        $userA = \App\Models\User::factory()->create();
        $ledgerA = Ledger::factory()->create();
        $ledgerA->users()->attach($userA, ['role' => 'owner']);

        $userB = \App\Models\User::factory()->create();
        $ledgerB = Ledger::factory()->create();
        $ledgerB->users()->attach($userB, ['role' => 'owner']);

        $accountA = Account::factory()->create(['ledger_id' => $ledgerA->id, 'type' => AccountType::ASSET]);
        
        // Transaction in Ledger A
        $transA = Transaction::factory()->create(['ledger_id' => $ledgerA->id]);
        JournalEntry::create([
            'transaction_id' => $transA->id,
            'account_id' => $accountA->id,
            'type' => 'DEBIT',
            'amount' => 100,
            'entry_date' => now()
        ]);

        // Transaction in Ledger B (simulating leaked data)
        $transB = Transaction::factory()->create(['ledger_id' => $ledgerB->id]);
        \DB::table('journal_entries')->insert([
            'transaction_id' => $transB->id,
            'account_id' => $accountA->id,
            'type' => 'DEBIT',
            'amount' => 500,
            'entry_date' => now()
        ]);

        // Test Ledger A
        $this->actingAs($userA);
        session(['current_ledger_id' => $ledgerA->id]);
        $balances = $this->action->execute([$accountA->id]);
        $this->assertEquals(100, $balances->get($accountA->id));

        // Test Ledger B
        $this->actingAs($userB);
        session(['current_ledger_id' => $ledgerB->id]);
        $balances = $this->action->execute([$accountA->id]);
        $this->assertEquals(500, $balances->get($accountA->id));
    }
}
