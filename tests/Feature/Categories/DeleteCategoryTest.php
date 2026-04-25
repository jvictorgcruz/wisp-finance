<?php

namespace Tests\Feature\Categories;

use App\Actions\Categories\DeleteCategoryAction;
use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\Ledger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->user->ledgers()->attach($this->ledger);
    $this->actingAs($this->user);

    session(['current_ledger_id' => $this->ledger->id]);
});

test('it soft deletes a category without history', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'is_system' => false,
    ]);

    $action = new DeleteCategoryAction();
    $action->execute($category);

    $this->assertSoftDeleted('accounts', ['id' => $category->id]);
});

test('it inactivates a category with history instead of deleting', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'is_system' => false,
    ]);

    // Create a subaccount and entry to represent history
    $sub = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'parent_id' => $category->id,
        'type' => AccountType::EXPENSE,
    ]);

    JournalEntry::factory()->create([
        'ledger_id' => $this->ledger->id,
        'account_id' => $sub->id,
        'amount' => 1000,
    ]);

    $action = new DeleteCategoryAction();
    $action->execute($category);

    // Parent should be inactive
    expect($category->fresh()->status)->toBe(AccountStatus::INACTIVE);
    // Child should also be inactive
    expect($sub->fresh()->status)->toBe(AccountStatus::INACTIVE);
    
    // None should be deleted
    $this->assertDatabaseHas('accounts', ['id' => $category->id, 'deleted_at' => null]);
    $this->assertDatabaseHas('accounts', ['id' => $sub->id, 'deleted_at' => null]);
});

test('it recursive deletes a whole tree without history', function () {
    $parent = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'is_system' => false,
    ]);

    $child = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'parent_id' => $parent->id,
        'type' => AccountType::EXPENSE,
    ]);

    $action = new DeleteCategoryAction();
    $action->execute($parent);

    $this->assertSoftDeleted('accounts', ['id' => $parent->id]);
    $this->assertSoftDeleted('accounts', ['id' => $child->id]);
});

test('it prevents deletion of system categories', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'is_system' => true,
    ]);

    $action = new DeleteCategoryAction();
    
    expect(fn() => $action->execute($category))
        ->toThrow(ValidationException::class);
});
