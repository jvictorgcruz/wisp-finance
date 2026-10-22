<?php

use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('newly registered user has has_seen_welcome_modal set to false', function () {
    $this->post('/en/register', [
        'name' => 'Novo Usuário',
        'email' => 'novo@example.com',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $user = User::where('email', 'novo@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->has_seen_welcome_modal)->toBeFalse();
});

test('newly created demo user has has_seen_welcome_modal set to false', function () {
    SystemSetting::updateOrCreate(
        ['key' => 'demo_mode'],
        ['is_active' => true, 'title' => 'demo_mode', 'description' => 'demo_mode_desc']
    );

    $this->get('/demo');

    $user = auth()->user()->fresh();
    expect($user)->not->toBeNull();
    expect($user->is_demo)->toBeTrue();
    expect($user->has_seen_welcome_modal)->toBeFalse();
});

test('authenticated user can dismiss welcome modal', function () {
    $user = User::factory()->create([
        'has_seen_welcome_modal' => false,
    ]);

    $response = $this->actingAs($user)->postJson('/user/welcome-dismissed');

    $response->assertOk();
    $response->assertJson(['success' => true]);

    expect($user->fresh()->has_seen_welcome_modal)->toBeTrue();
});

test('guest cannot dismiss welcome modal', function () {
    $response = $this->postJson('/user/welcome-dismissed');

    $response->assertUnauthorized();
});
