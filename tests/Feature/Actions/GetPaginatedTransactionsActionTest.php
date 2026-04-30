<?php

namespace Tests\Feature\Actions;

use App\Actions\Transactions\GetPaginatedTransactionsAction;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\Transaction;
use App\Models\JournalEntry;
use App\Enums\AccountType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->action = app(GetPaginatedTransactionsAction::class);
});

test('it returns paginated and formatted transactions', function () {
    $ledger = Ledger::factory()->create();
    $user = \App\Models\User::factory()->create(['current_ledger_id' => $ledger->id]);
    $ledger->users()->attach($user, ['role' => 'owner']);
    Auth::login($user);

    $asset = Account::factory()->create(['ledger_id' => $ledger->id, 'type' => AccountType::ASSET, 'name' => 'Bank']);
    $expense = Account::factory()->create(['ledger_id' => $ledger->id, 'type' => AccountType::EXPENSE, 'name' => 'Food']);

    $transaction = Transaction::factory()->create([
        'ledger_id' => $ledger->id,
        'description' => 'Grocery Store',
        'date' => now()
    ]);

    // Expense: Debit Category, Credit Asset
    JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $expense->id,
        'type' => 'DEBIT',
        'amount' => 50.00, // 5000 cents
        'entry_date' => now()
    ]);

    JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $asset->id,
        'type' => 'CREDIT',
        'amount' => 50.00,
        'entry_date' => now()
    ]);

    $results = $this->action->execute();

    expect($results)->toBeInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class);
    expect($results->count())->toBe(1);
    
    $item = $results->first();
    expect($item['description'])->toBe('Grocery Store');
    expect($item['amount'])->toBe(5000);
    expect($item['type'])->toBe('EXPENSE');
    expect($item['main_account'])->toBe('Food');
    expect($item['other_account'])->toBe('Bank');
});

test('it isolates transactions by ledger', function () {
    $ledgerA = Ledger::factory()->create();
    $userA = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerA->id]);
    $ledgerA->users()->attach($userA, ['role' => 'owner']);

    $ledgerB = Ledger::factory()->create();
    $userB = \App\Models\User::factory()->create(['current_ledger_id' => $ledgerB->id]);
    $ledgerB->users()->attach($userB, ['role' => 'owner']);

    Transaction::factory()->create(['ledger_id' => $ledgerA->id, 'description' => 'Trans A']);
    Transaction::factory()->create(['ledger_id' => $ledgerB->id, 'description' => 'Trans B']);

    Auth::login($userA);
    $resultsA = $this->action->execute();
    expect($resultsA->count())->toBe(1);
    expect($resultsA->first()['description'])->toBe('Trans A');

    Auth::login($userB);
    $resultsB = $this->action->execute();
    expect($resultsB->count())->toBe(1);
    expect($resultsB->first()['description'])->toBe('Trans B');
});

test('it filters transactions by search query', function () {
    $ledger = Ledger::factory()->create();
    $user = \App\Models\User::factory()->create(['current_ledger_id' => $ledger->id]);
    $ledger->users()->attach($user, ['role' => 'owner']);
    Auth::login($user);

    Transaction::factory()->create(['ledger_id' => $ledger->id, 'description' => 'TargetTransaction']);
    Transaction::factory()->create(['ledger_id' => $ledger->id, 'description' => 'OtherItem']);

    $results = $this->action->execute(15, ['search' => 'Target']);
    expect($results->count())->toBe(1);
    expect($results->first()['description'])->toBe('TargetTransaction');
});
