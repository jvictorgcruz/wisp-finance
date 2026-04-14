<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/en/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/en/login', [
        'email' => $user->email,
        'password' => 'Password123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/en/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('authenticated session sets current_ledger_id', function () {
    // We register first to ensure a ledger is created
    $this->post('/en/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $user = User::where('email', 'john@example.com')->first();
    $ledger = $user->ledgers()->first();

    $this->post('/logout');

    // Now login
    $this->post('/en/login', [
        'email' => 'john@example.com',
        'password' => 'Password123',
    ]);

    expect(session('current_ledger_id'))->toBe($ledger->id);
});
