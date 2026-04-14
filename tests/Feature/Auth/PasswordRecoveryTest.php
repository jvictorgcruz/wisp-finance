<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\Auth\PasswordResetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public ?User $user = null;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);
    }

    public function test_forgot_password_page_can_be_rendered(): void
    {
        $response = $this->get('/en/forgot-password');
        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $response = $this->post('/en/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertSessionHas('status');
        
        Notification::assertSentTo(
            $this->user,
            PasswordResetNotification::class
        );
    }

    public function test_reset_password_link_sends_localized_messages(): void
    {
        Notification::fake();

        // Test Portuguese
        $response = $this->post('/pt/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertSessionHas('status', 'Enviamos o link de redefinição de senha para o seu e-mail!');
        
        Notification::assertSentTo(
            $this->user,
            PasswordResetNotification::class,
            function ($notification) {
                return $notification->locale === 'pt';
            }
        );
    }

    public function test_reset_password_page_can_be_rendered(): void
    {
        $token = Password::createToken($this->user);

        $response = $this->get("/en/reset-password/{$token}?email=test@example.com");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Auth/ResetPassword')
            ->where('email', 'test@example.com')
            ->where('token', $token)
        );
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $token = Password::createToken($this->user);

        $response = $this->post('/en/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertTrue(Hash::check('NewPassword123', $this->user->fresh()->password));
    }

    public function test_password_reset_fails_with_weak_password(): void
    {
        $token = Password::createToken($this->user);

        $response = $this->post('/en/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertSessionHasErrors(['password']);
        $this->assertFalse(Hash::check('weak', $this->user->fresh()->password));
    }

    public function test_password_reset_validation_is_localized_in_portuguese(): void
    {
        $token = Password::createToken($this->user);

        // Post to localized PT route with invalid password (missing uppercase/lowercase mix)
        $response = $this->post('/pt/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'lowercase123', 
            'password_confirmation' => 'lowercase123',
        ]);

        $response->assertSessionHasErrors([
            'password' => 'O campo senha deve conter pelo menos uma letra maiúscula e uma minúscula.'
        ]);
    }
}
