<?php

use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\User;
use App\Support\DefaultAccountDefinitions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $authenticated = createAuthenticatedLedger();
    $this->user = $authenticated['user'];
    $this->ledger = $authenticated['ledger'];
});

test('it can access the categories index page', function () {
    $response = $this->get(route('categories.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Categories/Index')
        ->has('category_tree')
        ->has('available_icons')
        ->has('available_colors')
    );
});

test('index only returns revenue and expense categories', function () {
    Account::create([
        'type' => AccountType::ASSET,
        'name' => 'Checking Account',
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->get(route('categories.index'));

    $categories = $response->viewData('page')['props']['category_tree'];

    foreach ($categories as $category) {
        expect(in_array($category['type'], [AccountType::REVENUE->value, AccountType::EXPENSE->value]))->toBeTrue();
    }
});

test('it can create a new root category', function () {
    $response = $this->post(route('categories.store'), [
        'name' => 'Food',
        'type' => AccountType::EXPENSE->value,
        'ui_metadata' => [
            'icon' => DefaultAccountDefinitions::getAvailableIcons()[0],
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'ledger_id' => $this->ledger->id,
        'name' => 'Food',
        'type' => AccountType::EXPENSE->value,
        'parent_id' => null,
    ]);
});

test('it can create a subcategory under a parent', function () {
    $parent = Account::create([
        'name' => 'Food',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->post(route('categories.store'), [
        'name' => 'Restaurant',
        'type' => AccountType::EXPENSE->value,
        'parent_id' => $parent->id,
        'ui_metadata' => [
            'icon' => '',
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'ledger_id' => $this->ledger->id,
        'name' => 'Restaurant',
        'parent_id' => $parent->id,
    ]);
});

test('it validates category name is required', function () {
    $response = $this->post(route('categories.store'), [
        'name' => '',
        'type' => AccountType::EXPENSE->value,
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('it validates category type is a valid enum', function () {
    $response = $this->post(route('categories.store'), [
        'name' => 'Leisure',
        'type' => 'invalid-type',
    ]);

    $response->assertSessionHasErrors(['type']);
});

test('it can update a category name and metadata', function () {
    $category = Account::create([
        'name' => 'Old Name',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->put(route('categories.update', $category), [
        'name' => 'New Name',
        'type' => AccountType::EXPENSE->value,
        'ui_metadata' => [
            'icon' => DefaultAccountDefinitions::getAvailableIcons()[1],
            'color' => DefaultAccountDefinitions::getAvailableColors()[1],
        ],
    ]);

    $response->assertRedirect();
    expect($category->fresh()->name)->toBe('New Name');
});

test('it prevents changing the type of a category after creation', function () {
    $category = Account::create([
        'name' => 'Salary',
        'type' => AccountType::REVENUE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->put(route('categories.update', $category), [
        'name' => 'Salary',
        'type' => AccountType::EXPENSE->value, // Attempt to change type
        'ui_metadata' => [
            'icon' => DefaultAccountDefinitions::getAvailableIcons()[0],
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ]);

    $response->assertSessionHasErrors(['type']);
    expect($category->fresh()->type)->toBe(AccountType::REVENUE);
});

test('it can delete a non-system leaf category', function () {
    $parent = Account::create([
        'name' => 'Transport',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $leaf = Account::create([
        'name' => 'Bus',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $parent->id,
    ]);

    $response = $this->delete(route('categories.destroy', $leaf));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertSoftDeleted('accounts', ['id' => $leaf->id]);
});

test('it deletes a category tree recursively if no history exists', function () {
    $parent = Account::create([
        'name' => 'Food',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $child = Account::create([
        'name' => 'Restaurant',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $parent->id,
    ]);

    $response = $this->delete(route('categories.destroy', $parent));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertSoftDeleted('accounts', ['id' => $parent->id]);
    $this->assertSoftDeleted('accounts', ['id' => $child->id]);
});

test('it inactivates the entire tree when a category has historical entries', function () {
    $category = Account::create([
        'name' => 'Housing',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $sub = Account::create([
        'name' => 'Rent',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $category->id,
    ]);

    $transaction = \App\Models\Transaction::create([
        'ledger_id' => $this->ledger->id,
        'date' => now(),
        'description' => 'History Transaction',
    ]);

    \App\Models\JournalEntry::create([
        'transaction_id' => $transaction->id,
        'account_id' => $sub->id,
        'type' => 'DEBIT',
        'amount' => 150000,
        'entry_date' => now(),
    ]);

    $response = $this->delete(route('categories.destroy', $category));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect($category->fresh()->status)->toBe(AccountStatus::INACTIVE);
    expect($sub->fresh()->status)->toBe(AccountStatus::INACTIVE);
    $this->assertDatabaseHas('accounts', ['id' => $category->id, 'deleted_at' => null]);
});

test('it cannot delete a system category', function () {
    $category = Account::create([
        'name' => 'System Cat',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
        'is_system' => true,
    ]);

    $response = $this->delete(route('categories.destroy', $category));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('accounts', ['id' => $category->id, 'deleted_at' => null]);
});

test('it prevents creating a subcategory under a parent from another ledger', function () {
    $otherLedger = Ledger::factory()->create();
    $otherCategory = Account::withoutGlobalScopes()->create([
        'ledger_id' => $otherLedger->id,
        'name' => 'Other Ledger Category',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->post(route('categories.store'), [
        'name' => 'Should Fail',
        'type' => AccountType::EXPENSE->value,
        'parent_id' => $otherCategory->id,
        'ui_metadata' => [
            'icon' => '',
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});

test('it prevents creating a subcategory with a different type than its parent', function () {
    $parent = Account::create([
        'name' => 'Expense Parent',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $response = $this->post(route('categories.store'), [
        'name' => 'Revenue Child',
        'type' => AccountType::REVENUE->value, // Mismatch
        'parent_id' => $parent->id,
        'ui_metadata' => [
            'icon' => '',
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});

test('it prevents creating a subcategory under another subcategory (max depth 2)', function () {
    $root = Account::create([
        'name' => 'Root',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);

    $child = Account::create([
        'name' => 'Child',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => $root->id,
    ]);

    $response = $this->post(route('categories.store'), [
        'name' => 'Grandchild',
        'type' => AccountType::EXPENSE->value,
        'parent_id' => $child->id, // Attempt level 3
        'ui_metadata' => [
            'icon' => '',
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ]);

    $response->assertSessionHasErrors(['parent_id']);
});
