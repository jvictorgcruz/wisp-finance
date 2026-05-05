<?php

use App\Actions\Accounts\GetAccountBalanceAction;
use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\JournalEntry;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $this->user   = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->ledger->users()->attach($this->user, ['role' => 'owner']);

    Auth::login($this->user);
    session(['current_ledger_id' => $this->ledger->id]);

    $this->action = new GetAccountBalanceAction();
});

// -------------------------------------------------------------------------
// ASSET accounts
// -------------------------------------------------------------------------

test('asset balance = debits minus credits', function () {
    $account = Account::create([
        'name'   => 'Checking Account',
        'type'   => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'DEBIT',  'amount' => 50000, 'entry_date' => today()]);
    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'CREDIT', 'amount' => 20000, 'entry_date' => today()]);

    expect($this->action->executeSingle($account))->toBe(30000);
});

test('asset account with only debits returns positive balance', function () {
    $account = Account::create([
        'name'   => 'Wallet',
        'type'   => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'DEBIT', 'amount' => 10000, 'entry_date' => today()]);

    expect($this->action->executeSingle($account))->toBe(10000);
});

// -------------------------------------------------------------------------
// LIABILITY accounts
// -------------------------------------------------------------------------

test('liability balance = credits minus debits', function () {
    $account = Account::create([
        'name'   => 'Credit Card',
        'type'   => AccountType::LIABILITY,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'CREDIT', 'amount' => 30000, 'entry_date' => today()]);
    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'DEBIT',  'amount' => 10000, 'entry_date' => today()]);

    expect($this->action->executeSingle($account))->toBe(20000);
});

// -------------------------------------------------------------------------
// EXPENSE accounts
// -------------------------------------------------------------------------

test('expense balance = debits minus credits', function () {
    $account = Account::create([
        'name'   => 'Food',
        'type'   => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'DEBIT',  'amount' => 7500, 'entry_date' => today()]);
    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'CREDIT', 'amount' => 2500, 'entry_date' => today()]);

    expect($this->action->executeSingle($account))->toBe(5000);
});

// -------------------------------------------------------------------------
// REVENUE accounts
// -------------------------------------------------------------------------

test('revenue balance = credits minus debits', function () {
    $account = Account::create([
        'name'   => 'Salary',
        'type'   => AccountType::REVENUE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'CREDIT', 'amount' => 500000, 'entry_date' => today()]);

    expect($this->action->executeSingle($account))->toBe(500000);
});

// -------------------------------------------------------------------------
// Zero / empty cases
// -------------------------------------------------------------------------

test('account with no journal entries returns zero', function () {
    $account = Account::create([
        'name'   => 'Empty Account',
        'type'   => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    expect($this->action->executeSingle($account))->toBe(0);
});

test('account with equal debits and credits returns zero', function () {
    $account = Account::create([
        'name'   => 'Balanced Ledger',
        'type'   => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'DEBIT',  'amount' => 15000, 'entry_date' => today()]);
    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'CREDIT', 'amount' => 15000, 'entry_date' => today()]);

    expect($this->action->executeSingle($account))->toBe(0);
});

// -------------------------------------------------------------------------
// Multi-tenant isolation
// -------------------------------------------------------------------------

test('entries from another ledger do not contaminate balance', function () {
    // Account in this ledger
    $account = Account::create([
        'name'   => 'My Account',
        'type'   => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);
    JournalEntry::create(['transaction_id' => $transaction->id, 'account_id' => $account->id, 'type' => 'DEBIT', 'amount' => 5000, 'entry_date' => today()]);

    // Create another ledger with another user
    $otherUser   = User::factory()->create();
    $otherLedger = Ledger::factory()->create();
    $otherLedger->users()->attach($otherUser, ['role' => 'owner']);

    // Create a transaction in other ledger
    $otherTransaction = Transaction::factory()->create(['ledger_id' => $otherLedger->id]);

    // Insert entry in other ledger's transaction
    JournalEntry::create([
        'transaction_id' => $otherTransaction->id,
        'account_id' => $account->id, // Linking to the SAME account but different transaction/ledger
        'type'       => 'DEBIT',
        'amount'     => 99999,
        'entry_date' => today(),
    ]);

    // Balance should only reflect this ledger's entries
    expect($this->action->executeSingle($account))->toBe(5000);
});
