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
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->ledger->users()->attach($this->user, ['role' => 'owner']);
    
    Auth::login($this->user);
    session(['current_ledger_id' => $this->ledger->id]);
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
    $response = $this->post(route('accounts.store'), [
        'name' => 'New Savings',
        'type' => 'asset',
    ]);

    $response->assertRedirect(route('accounts.index'));
    $this->assertDatabaseHas('accounts', [
        'name' => 'New Savings',
        'type' => 'asset',
        'ledger_id' => $this->ledger->id,
    ]);
});

test('it validates account name length', function () {
    $response = $this->post(route('accounts.store'), [
        'name' => 'A', // Too short (min:2)
        'type' => 'asset',
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
    $account = Account::create([
        'name' => 'Old Name',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->put(route('accounts.update', $account), [
        'name' => 'Updated Name',
        'type' => 'asset',
    ]);

    $response->assertRedirect(route('accounts.index'));
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

    $response->assertRedirect(route('accounts.index'));
    
    // Rule: Accounts WITHOUT history are soft deleted (deleted_at)
    $this->assertSoftDeleted('accounts', ['id' => $account->id]);
});

test('it inactivates an account with zero balance', function () {
    $account = Account::create([
        'name' => 'Account with Zero Balance',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    // Create offsetting journal entries (balance = 0)
    \App\Models\JournalEntry::create([
        'ledger_id' => $this->ledger->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 1000,
        'entry_date' => now(),
    ]);
    \App\Models\JournalEntry::create([
        'ledger_id' => $this->ledger->id,
        'account_id' => $account->id,
        'type' => 'CREDIT',
        'amount' => 1000,
        'entry_date' => now(),
    ]);

    $response = $this->delete(route('accounts.destroy', $account));

    $response->assertRedirect(route('accounts.index'));
    
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

    // Create a journal entry (balance != 0)
    \App\Models\JournalEntry::create([
        'ledger_id' => $this->ledger->id,
        'account_id' => $account->id,
        'type' => 'DEBIT',
        'amount' => 5000,
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
        'name' => 'Parent Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    Account::create([
        'name' => 'Child Asset',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $parent->id,
    ]);

    $otherRoot = Account::create([
        'name' => 'Other Root',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    // Try to move $parent under $otherRoot (Rule 2)
    $response = $this->put(route('accounts.update', $parent), [
        'name' => 'Moved Parent',
        'type' => 'asset',
        'parent_id' => $otherRoot->id,
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});
