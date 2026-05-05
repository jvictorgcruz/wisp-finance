<?php

use App\Models\User;
use App\Notifications\Auth\PasswordResetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);
});

test('forgot password page can be rendered', function () {
    $response = $this->get(route('password.request.locale', ['locale' => 'pt']));
    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Notification::fake();

    $response = $this->post(route('password.email.locale', ['locale' => 'pt']), [
        'email' => $this->user->email,
    ]);

    $response->assertSessionHas('status');
    Notification::assertSentTo($this->user, PasswordResetNotification::class);
});

test('reset password page can be rendered', function () {
    $token = Password::createToken($this->user);

    $response = $this->get(route('password.reset.locale', [
        'locale' => 'pt',
        'token' => $token,
        'email' => $this->user->email,
    ]));

    $response->assertStatus(200);
});

test('password can be reset with valid token', function () {
    Notification::fake();
    $token = Password::createToken($this->user);

    $response = $this->post(route('password.store.locale', ['locale' => 'pt']), [
        'token' => $token,
        'email' => $this->user->email,
        'password' => 'New-password123',
        'password_confirmation' => 'New-password123',
    ]);

    $response->assertSessionHas('status');
    expect(Hash::check('New-password123', $this->user->refresh()->password))->toBeTrue();
});
