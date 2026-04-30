<?php


use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $authenticated = createAuthenticatedLedger();
    $this->user = $authenticated['user'];
    $this->ledger = $authenticated['ledger'];
});

test('it can list accounts', function () {
    Account::create([
        'name' => 'Test Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->get(route('accounts.index'));
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Accounts/Index')
        ->has('accounts')
    );
});

test('it can create an account', function () {
    $parent = Account::create([
        'name' => 'Root Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->post(route('accounts.store'), [
        'name' => 'New Savings',
        'type' => 'asset',
        'parent_id' => $parent->id,
        'ui_metadata' => ['color' => '#10b981', 'icon' => 'Wallet'],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'name' => 'New Savings',
        'type' => 'asset',
        'ledger_id' => $this->ledger->id,
    ]);
});

test('it validates account name length', function () {
    $response = $this->post(route('accounts.store'), [
        'name' => 'A', // Too short (min:2)
        'type' => 'expense',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('it validates account type enum', function () {
    $response = $this->post(route('accounts.store'), [
        'name' => 'Valid Name',
        'type' => 'invalid-type',
    ]);

    $response->assertSessionHasErrors(['type']);
});

test('it validates account type matching with parent', function () {
    $parent = Account::create([
        'name' => 'Parent Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    // Try to create an EXPENSE child for an ASSET parent
    $response = $this->post(route('accounts.store'), [
        'name' => 'Invalid Child',
        'type' => 'expense',
        'parent_id' => $parent->id,
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});

test('it prevents using a parent_id from another ledger', function () {
    $otherLedger = Ledger::factory()->create();
    $otherAccount = Account::withoutGlobalScopes()->create([
        'ledger_id' => $otherLedger->id,
        'name' => 'Other Ledger Account',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->post(route('accounts.store'), [
        'name' => 'Stealing Parent',
        'type' => 'asset',
        'parent_id' => $otherAccount->id,
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});

test('it can update an account', function () {
    $parent = Account::create([
        'name' => 'Root Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $account = Account::create([
        'name' => 'Old Name',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $parent->id,
    ]);

    $response = $this->put(route('accounts.update', $account), [
        'name' => 'Updated Name',
        'type' => 'asset',
        'parent_id' => $parent->id,
        'ui_metadata' => ['color' => '#10b981', 'icon' => 'Wallet'],
    ]);

    $response->assertRedirect();
    expect($account->fresh()->name)->toBe('Updated Name');
});

test('it cannot delete a system account', function () {
    $account = Account::create([
        'name' => 'System Account',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
        'is_system' => true,
    ]);

    $response = $this->delete(route('accounts.destroy', $account));

    $response->assertStatus(403);
    $this->assertDatabaseHas('accounts', ['id' => $account->id]);
});

test('it cannot delete an account with children', function () {
    $parent = Account::create([
        'name' => 'Parent',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    Account::create([
        'name' => 'Child',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $parent->id,
    ]);

    $response = $this->delete(route('accounts.destroy', $parent));

    $response->assertSessionHasErrors(['id']);
    $this->assertDatabaseHas('accounts', ['id' => $parent->id]);
});

test('it soft deletes a regular account without history', function () {
    $account = Account::create([
        'name' => 'To Be Deleted',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->delete(route('accounts.destroy', $account));

    $response->assertRedirect();
    
    // Rule: Accounts WITHOUT history are soft deleted (deleted_at)
    $this->assertSoftDeleted('accounts', ['id' => $account->id]);
});

test('it inactivates an account with zero balance', function () {
    $account = Account::create([
        'name' => 'Account with Zero Balance',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = \App\Models\Transaction::create([
        'ledger_id' => $this->ledger->id,
        'date' => now(),
        'description' => 'Zero Balance Trans',
    ]);

    // Create offsetting journal entries (balance = 0)
    \App\Models\JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 10.00,
        'entry_date' => now(),
    ]);
    \App\Models\JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'CREDIT',
        'amount' => 10.00,
        'entry_date' => now(),
    ]);

    $response = $this->delete(route('accounts.destroy', $account));

    $response->assertRedirect();
    
    // Rule: Accounts WITH history and zero balance are INACTIVATED
    expect($account->fresh()->status)->toBe(AccountStatus::INACTIVE);
    $this->assertDatabaseHas('accounts', ['id' => $account->id, 'deleted_at' => null]);
});

test('it prevents inactivation of an account with a non-zero balance', function () {
    $account = Account::create([
        'name' => 'Account with Balance',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $transaction = \App\Models\Transaction::create([
        'ledger_id' => $this->ledger->id,
        'date' => now(),
        'description' => 'Balance Trans',
    ]);

    // Create a journal entry (balance != 0)
    \App\Models\JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 50.00,
        'entry_date' => now(),
    ]);

    $response = $this->delete(route('accounts.destroy', $account));

    $response->assertSessionHasErrors(['id']);
    expect($account->fresh()->status)->toBe(AccountStatus::ACTIVE);
});

test('it prevents creating a third level account', function () {
    $this->withoutExceptionHandling();
    $root = Account::create([
        'name' => 'Root Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $child = Account::create([
        'name' => 'Child Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $root->id,
    ]);

    $response = $this->post(route('accounts.store'), [
        'name' => 'Grandchild Asset',
        'type' => 'asset',
        'parent_id' => $child->id,
    ]);

    $response->assertSessionHasErrors(['parent_id']);
})->throws(\Illuminate\Validation\ValidationException::class);

test('it prevents a parent account from becoming a child', function () {
    $parent = Account::create([
        'name' => 'Parent Rev',
        'type' => AccountType::REVENUE,
        'status' => AccountStatus::ACTIVE,
    ]);

    Account::create([
        'name' => 'Child Rev',
        'type' => AccountType::REVENUE,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $parent->id,
    ]);

    $otherRoot = Account::create([
        'name' => 'Other Root Rev',
        'type' => AccountType::REVENUE,
        'status' => AccountStatus::ACTIVE,
    ]);

    // Try to move $parent under $otherRoot (Rule 2)
    $response = $this->put(route('accounts.update', $parent), [
        'name' => 'Moved Parent',
        'type' => 'revenue',
        'parent_id' => $otherRoot->id,
        'ui_metadata' => ['color' => '#10b981', 'icon' => 'Wallet'],
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});

test('it blocks updating a root asset or liability', function () {
    $account = Account::create([
        'name' => 'Root Liability',
        'type' => AccountType::LIABILITY,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->put(route('accounts.update', $account), [
        'name' => 'Hack Name',
        'type' => 'liability',
        'ui_metadata' => ['color' => '#f43f5e', 'icon' => 'TrendingDown'],
    ]);

    $response->assertStatus(403);
});

test('it allows updating a root revenue or expense', function () {
    $account = Account::create([
        'name' => 'Root Expense',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->put(route('accounts.update', $account), [
        'name' => 'Updated Expense Root',
        'type' => 'expense',
        'ui_metadata' => ['color' => '#ef4444', 'icon' => 'Home'],
    ]);

    $response->assertRedirect();
    expect($account->fresh()->name)->toBe('Updated Expense Root');
});

test('it enforces parent_id for new assets and liabilities', function () {
    $response = $this->post(route('accounts.store'), [
        'name' => 'Invalid Root Asset',
        'type' => 'asset',
        'ui_metadata' => ['color' => '#10b981', 'icon' => 'Wallet'],
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});

test('it allows creating a root category without a parent', function () {
    $response = $this->post(route('accounts.store'), [
        'name' => 'New Category Root',
        'type' => 'expense',
        'ui_metadata' => ['color' => '#ef4444', 'icon' => 'Utensils'],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'name' => 'New Category Root',
        'type' => 'expense',
        'parent_id' => null,
    ]);
});
