<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use App\Enums\AccountType;
use App\Support\DefaultAccountDefinitions;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create();
    $this->ledger = Ledger::factory()->create();
    $this->user->ledgers()->attach($this->ledger, ['role' => 'admin']);
    $this->actingAs($this->user);
    
    // Set current ledger in session
    session(['current_ledger_id' => $this->ledger->id]);
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
    // There are already seeded categories from the factory/seeder, 
    // but let's ensure we have a mix.
    Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::ASSET,
        'name' => 'Should Not See This Asset',
    ]);

    $response = $this->get(route('categories.index'));
    
    $categories = $response->viewData('page')['props']['category_tree'];
    
    foreach ($categories as $category) {
        expect(in_array($category['type'], [AccountType::REVENUE->value, AccountType::EXPENSE->value]))->toBeTrue();
    }
});

test('it can create a new category', function () {
    $data = [
        'name' => 'New Test Category',
        'type' => AccountType::REVENUE->value,
        'ui_metadata' => [
            'icon' => DefaultAccountDefinitions::getAvailableIcons()[0],
            'color' => DefaultAccountDefinitions::getAvailableColors()[0],
        ],
    ];

    $response = $this->post(route('categories.store'), $data);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'ledger_id' => $this->ledger->id,
        'name' => 'New Test Category',
        'type' => AccountType::REVENUE->value,
    ]);
});

test('it can update a category', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'name' => 'Old Name',
    ]);

    $data = [
        'name' => 'Updated Name',
        'type' => AccountType::EXPENSE->value,
        'ui_metadata' => [
            'icon' => DefaultAccountDefinitions::getAvailableIcons()[1],
            'color' => DefaultAccountDefinitions::getAvailableColors()[1],
        ],
    ];

    $response = $this->put(route('categories.update', $category), $data);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('accounts', [
        'id' => $category->id,
        'name' => 'Updated Name',
    ]);
});

test('it cannot delete a category with children', function () {
    $parent = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
    ]);
    
    Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'parent_id' => $parent->id,
        'type' => AccountType::EXPENSE,
    ]);

    $response = $this->delete(route('categories.destroy', $parent));
    
    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('accounts', ['id' => $parent->id]);
});

test('it cannot delete a system category', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'is_system' => true,
    ]);

    $response = $this->delete(route('categories.destroy', $category));
    
    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('accounts', ['id' => $category->id]);
});

test('it can delete a non-system leaf category', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'is_system' => false,
        'parent_id' => Account::factory()->create(['ledger_id' => $this->ledger->id])->id, // must be child to be deletable check Task 011?
    ]);

    $response = $this->delete(route('categories.destroy', $category));
    
    $response->assertRedirect();
    $this->assertSoftDeleted('accounts', ['id' => $category->id]);
});
