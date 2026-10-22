<?php

use App\Models\User;
use App\Models\Ledger;
use App\Models\Account;
use App\Models\SystemSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

test('guest can register demo user and gets redirected to dashboard', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => true, 'title' => 'demo_mode', 'description' => 'demo_mode_desc']
    );

    $response = $this->get('/demo');

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = auth()->user();
    expect($user->is_demo)->toBeTrue();
    expect($user->email)->toContain('@wisp.test');
    expect($user->currentLedger())->not->toBeNull();

    // Accounts seeded
    $accountsCount = Account::withoutGlobalScopes()->where('ledger_id', $user->currentLedger()->id)->count();
    expect($accountsCount)->toBeGreaterThan(0);
});

test('guest can register demo user via localized route', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => true, 'title' => 'demo_mode', 'description' => 'demo_mode_desc']
    );

    $response = $this->get('/pt/demo');

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = auth()->user();
    expect($user->is_demo)->toBeTrue();
});

test('guest can access demo via direct GET url', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => true, 'title' => 'demo_mode', 'description' => 'demo_mode_desc']
    );

    $response = $this->get('/demo');

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = auth()->user();
    expect($user->is_demo)->toBeTrue();
});

test('demo registration is blocked with 403 when demo_mode setting is disabled', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => false, 'title' => 'demo_mode', 'description' => 'demo_mode_desc']
    );

    $response = $this->get('/demo');

    $response->assertForbidden();
    $this->assertGuest();
});

test('demo user can bypass maintenance mode when demo_mode is active', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['is_active' => true, 'title' => 'maintenance_mode', 'description' => 'desc']
    );
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => true, 'title' => 'demo_mode', 'description' => 'desc']
    );

    $demoUser = User::factory()->create([
        'is_demo' => true,
    ]);

    $response = $this->actingAs($demoUser)->get('/dashboard');
    $response->assertOk();
});

test('demo user is blocked by maintenance mode when demo_mode is inactive', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['is_active' => true, 'title' => 'maintenance_mode', 'description' => 'desc']
    );
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => false, 'title' => 'demo_mode', 'description' => 'desc']
    );

    $demoUser = User::factory()->create([
        'is_demo' => true,
    ]);

    $response = $this->actingAs($demoUser)->get('/dashboard');
    $response->assertStatus(503);
});

test('demo route enforces rate limiting', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => true, 'title' => 'demo_mode', 'description' => 'demo_mode_desc']
    );

    for ($i = 0; $i < 3; $i++) {
        $this->get('/demo');
        /** @var \Illuminate\Auth\SessionGuard $guard */
        $guard = \Illuminate\Support\Facades\Auth::guard('web');
        $guard->logout();
    }

    $response = $this->get('/demo');
    $response->assertStatus(429);
});
