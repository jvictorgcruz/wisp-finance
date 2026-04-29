<?php

use App\Actions\Auth\RegisterUserAction;
use App\Actions\Ledgers\CreateDefaultAccountsAction;
use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var TestCase $this */
    $this->action = new RegisterUserAction();
    $this->data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'Password123',
    ];
});

test('it creates a user, ledger and default accounts successfully', function () {
    $user = $this->action->execute($this->data);

    expect(User::count())->toBe(1);
    expect(Ledger::count())->toBe(1);
    
    // Check if user is owner of the ledger
    expect($user->ledgers->first()->pivot->role)->toBe('owner');
    
    // Check if default accounts were created (called via LedgerObserver)
    $accountsCount = Account::withoutGlobalScopes()->where('ledger_id', $user->currentLedger()->id)->count();
    expect($accountsCount)->toBeGreaterThan(0);
});

test('it sets the session values after registration', function () {
    $user = $this->action->execute($this->data);
    $ledger = $user->currentLedger();

    expect(session('locale'))->toBe($user->locale);
    expect(session('current_ledger_id'))->toBe($ledger->id);
});

test('it localizes the ledger name based on application locale', function () {
    App::setLocale('pt');
    $user = $this->action->execute($this->data);
    $ledger = $user->currentLedger();
    
    expect($ledger->name)->toBe(__('accounts.default_ledger_name', ['name' => $user->name]));
    
    // Reset locale
    App::setLocale('en');
});

test('it rolls back everything if ledger creation fails', function () {
    // Force failure on Ledger creation using Eloquent events
    Ledger::creating(function () {
        throw new \RuntimeException('Failed to create ledger');
    });

    try {
        $this->action->execute($this->data);
    } catch (\RuntimeException $e) {
        expect($e->getMessage())->toBe('Failed to create ledger');
    }

    expect(User::count())->toBe(0);
    expect(Ledger::count())->toBe(0);
    
    // Cleanup for other tests
    Ledger::flushEventListeners();
});

test('it rolls back everything if account seeding fails', function () {
    // Mock CreateDefaultAccountsAction to throw an exception
    // This will be resolved by the LedgerObserver via app()
    $this->mock(CreateDefaultAccountsAction::class, function ($mock) {
        $mock->shouldReceive('execute')->andThrow(new \RuntimeException('Failed to seed accounts'));
    });

    try {
        $this->action->execute($this->data);
    } catch (\RuntimeException $e) {
        expect($e->getMessage())->toBe('Failed to seed accounts');
    }

    expect(User::count())->toBe(0);
    expect(Ledger::count())->toBe(0);
});
