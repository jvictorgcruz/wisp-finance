<?php

use App\Actions\Categories\DeleteCategoryAction;
use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $authenticated = createAuthenticatedLedger();
    $this->user = $authenticated['user'];
    $this->ledger = $authenticated['ledger'];
});

test('it soft deletes a category without history', function () {
    $category = Account::create([
        'type' => AccountType::EXPENSE,
        'name' => 'Food',
        'is_system' => false,
    ]);

    $action = new DeleteCategoryAction();
    $action->execute($category);

    $this->assertSoftDeleted('accounts', ['id' => $category->id]);
});

test('it inactivates a category with history instead of deleting', function () {
    $category = Account::create([
        'type' => AccountType::EXPENSE,
        'name' => 'Housing',
        'is_system' => false,
    ]);

    $sub = Account::create([
        'type' => AccountType::EXPENSE,
        'name' => 'Rent',
        'parent_id' => $category->id,
    ]);

    // Simulate history by creating a direct journal entry on the subcategory
    \App\Models\JournalEntry::create([
        'ledger_id' => $this->ledger->id,
        'account_id' => $sub->id,
        'type' => 'DEBIT',
        'amount' => 150000,
        'entry_date' => now(),
    ]);

    $action = new DeleteCategoryAction();
    $action->execute($category);

    // Parent should be inactivated, not deleted
    expect($category->fresh()->status)->toBe(AccountStatus::INACTIVE);
    // Child should also be inactivated
    expect($sub->fresh()->status)->toBe(AccountStatus::INACTIVE);
    // Neither should be soft deleted
    $this->assertDatabaseHas('accounts', ['id' => $category->id, 'deleted_at' => null]);
    $this->assertDatabaseHas('accounts', ['id' => $sub->id, 'deleted_at' => null]);
});

test('it recursively deletes a whole tree without history', function () {
    $parent = Account::create([
        'type' => AccountType::EXPENSE,
        'name' => 'Transport',
        'is_system' => false,
    ]);

    $child = Account::create([
        'type' => AccountType::EXPENSE,
        'name' => 'Bus',
        'parent_id' => $parent->id,
    ]);

    $action = new DeleteCategoryAction();
    $action->execute($parent);

    $this->assertSoftDeleted('accounts', ['id' => $parent->id]);
    $this->assertSoftDeleted('accounts', ['id' => $child->id]);
});

test('it throws a validation exception when deleting a system category', function () {
    $category = Account::create([
        'type' => AccountType::EXPENSE,
        'name' => 'System Category',
        'is_system' => true,
    ]);

    $action = new DeleteCategoryAction();

    expect(fn () => $action->execute($category))
        ->toThrow(ValidationException::class);
});
