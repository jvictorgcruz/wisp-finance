<?php

use App\Actions\Auth\RegisterUserAction;
use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(RefreshDatabase::class);

test('it prunes demo users older than 7 days by default and keeps recent ones', function () {
    $registerAction = app(RegisterUserAction::class);

    // Create expired demo user (10 days old)
    $expiredDemoUser = $registerAction->execute([
        'name' => 'Expired Visitor',
        'email' => 'expired@wisp.test',
        'password' => 'Secret123!',
        'is_demo' => true,
    ]);
    User::where('id', $expiredDemoUser->id)->update(['created_at' => Carbon::now()->subDays(10)]);
    $expiredLedgerId = $expiredDemoUser->currentLedger()->id;

    // Create fresh demo user (2 days old)
    $freshDemoUser = $registerAction->execute([
        'name' => 'Fresh Visitor',
        'email' => 'fresh@wisp.test',
        'password' => 'Secret123!',
        'is_demo' => true,
    ]);
    User::where('id', $freshDemoUser->id)->update(['created_at' => Carbon::now()->subDays(2)]);
    $freshLedgerId = $freshDemoUser->currentLedger()->id;

    // Create regular user (15 days old)
    $regularUser = $registerAction->execute([
        'name' => 'Regular Member',
        'email' => 'member@example.com',
        'password' => 'Secret123!',
        'is_demo' => false,
    ]);
    User::where('id', $regularUser->id)->update(['created_at' => Carbon::now()->subDays(15)]);
    $regularLedgerId = $regularUser->currentLedger()->id;

    // Run prune command
    $this->artisan('demo:prune')
        ->expectsOutputToContain('Successfully pruned 1 demo user(s).')
        ->assertSuccessful();

    // Expired demo user and their data are gone
    expect(User::find($expiredDemoUser->id))->toBeNull();
    expect(Ledger::find($expiredLedgerId))->toBeNull();
    expect(Account::withoutGlobalScopes()->where('ledger_id', $expiredLedgerId)->count())->toBe(0);

    // Fresh demo user is untouched
    expect(User::find($freshDemoUser->id))->not->toBeNull();
    expect(Ledger::find($freshLedgerId))->not->toBeNull();
    expect(Account::withoutGlobalScopes()->where('ledger_id', $freshLedgerId)->count())->toBeGreaterThan(0);

    // Regular user is untouched
    expect(User::find($regularUser->id))->not->toBeNull();
    expect(Ledger::find($regularLedgerId))->not->toBeNull();
});

test('it supports custom days option', function () {
    $registerAction = app(RegisterUserAction::class);

    $demoUser = $registerAction->execute([
        'name' => '3 Day Visitor',
        'email' => '3day@wisp.test',
        'password' => 'Secret123!',
        'is_demo' => true,
    ]);
    User::where('id', $demoUser->id)->update(['created_at' => Carbon::now()->subDays(4)]);

    $this->artisan('demo:prune --days=3')
        ->expectsOutputToContain('Successfully pruned 1 demo user(s).')
        ->assertSuccessful();

    expect(User::find($demoUser->id))->toBeNull();
});
