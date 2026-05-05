<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('new users can register', function () {
    $response = $this->post('/en/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $response->assertRedirect('/');
    $this->assertAuthenticated();
});

test('registration creates a ledger with localized name', function () {
    $this->post('/en/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $user = User::where('email', 'john@example.com')->first();
    $ledger = $user->ledgers()->first();

    expect($ledger)->not->toBeNull();
    // Use __ helper to match the localized name generated in English
    expect($ledger->name)->toBe(__('accounts.default_ledger_name', ['name' => 'John Doe']));
    expect(session('current_ledger_id'))->toBe($ledger->id);
});

test('registration seeds default hierarchical accounts with translations', function () {
    $this->post('/en/register', [
        'name' => 'Alice',
        'email' => 'alice@example.com',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $user = User::where('email', 'alice@example.com')->first();
    $ledger = $user->ledgers()->first();

    // Check for some top-level accounts in English (default for /en prefix)
    $topLevelAccounts = Account::withoutGlobalScopes()
        ->where('ledger_id', $ledger->id)
        ->whereNull('parent_id')
        ->get();

    $topLevelNames = $topLevelAccounts->pluck('name');

    // System accounts (ASSET/LIABILITY/EQUITY) persist raw translation keys by design.
    // This is intentional: the hybrid localization strategy stores keys so names
    // update automatically when the user changes language (resolved at runtime on frontend).
    $cashTranslationKey = 'accounts.cash';
    expect($topLevelNames)->toContain($cashTranslationKey);

    // Category accounts (REVENUE/EXPENSE) persist translated strings at creation time
    // using the user's locale at the moment of registration (en in this test).
    expect($topLevelNames)->toContain(__('categories.salary'));
    expect($topLevelNames)->toContain(__('categories.housing'));


    // Check for nested accounts
    $housingCategoryName = __('categories.housing');
    $housing = Account::withoutGlobalScopes()
        ->where('ledger_id', $ledger->id)
        ->where('name', $housingCategoryName)
        ->first();

    $housingChildren = Account::withoutGlobalScopes()
        ->where('parent_id', $housing->id)
        ->get();

    $housingChildrenNames = $housingChildren->pluck('name');
    expect($housingChildrenNames)->toContain(__('categories.rent'));
    expect($housingChildrenNames)->toContain(__('categories.electricity'));
});

test('registration is atomic and rolls back on failure', function () {
    // We expect 0 users before
    expect(User::count())->toBe(0);

    // Use Eloquent events to force a failure during Ledger creation
    Ledger::creating(function () {
        throw new \RuntimeException('Simulated failure during ledger creation');
    });

    try {
        $this->post('/en/register', [
            'name' => 'Failed User',
            'email' => 'failed@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);
    } catch (\RuntimeException $e) {
        expect($e->getMessage())->toBe('Simulated failure during ledger creation');
    }

    // Verify rollback: User should not exist because Ledger creation failed inside the transaction
    expect(User::where('email', 'failed@example.com')->exists())->toBeFalse();
    expect(User::count())->toBe(0);
    
    // Clear the event listener for other tests if needed
    Ledger::flushEventListeners();
});
