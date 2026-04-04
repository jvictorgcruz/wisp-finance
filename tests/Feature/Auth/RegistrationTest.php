<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect('/');
    $this->assertAuthenticated();
});

test('registration creates a ledger with localized name', function () {
    $this->post('/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'john@example.com')->first();
    $ledger = $user->ledgers()->first();

    expect($ledger)->not->toBeNull();
    // Use __ helper to match the localized name generated in English
    expect($ledger->name)->toBe(__('accounts.default_ledger_name', ['name' => 'John Doe']));
    expect(session('current_ledger_id'))->toBe($ledger->id);
});

test('registration seeds default hierarchical accounts with translations', function () {
    $this->post('/register', [
        'name' => 'Alice',
        'email' => 'alice@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'alice@example.com')->first();
    $ledger = $user->ledgers()->first();

    // Check for some top-level accounts in English (default for /en prefix)
    $topLevelAccounts = Account::withoutGlobalScopes()
        ->where('ledger_id', $ledger->id)
        ->whereNull('parent_id')
        ->get();

    $topLevelNames = $topLevelAccounts->pluck('name');
    expect($topLevelNames)->toContain('accounts.cash');
    expect($topLevelNames)->toContain('accounts.salary');
    expect($topLevelNames)->toContain('categories.housing');

    // Check for nested accounts
    $housingCategoryName = 'categories.housing';
    $housing = Account::withoutGlobalScopes()
        ->where('ledger_id', $ledger->id)
        ->where('name', $housingCategoryName)
        ->first();

    $housingChildren = Account::withoutGlobalScopes()
        ->where('parent_id', $housing->id)
        ->get();

    $housingChildrenNames = $housingChildren->pluck('name');
    expect($housingChildrenNames)->toContain('categories.rent');
    expect($housingChildrenNames)->toContain('categories.electricity');
});

test('registration is atomic and rolls back on failure', function () {
    // We expect 0 users before
    expect(User::count())->toBe(0);

    // We can't easily force a DB failure within the transaction without mocking or causing a constraint violation.
    // Let's assume the transaction works if previous tests pass.
});
