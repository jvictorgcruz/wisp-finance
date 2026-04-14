<?php

namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $token
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        if ($this->locale) {
            app()->setLocale($this->locale);
        }

        return (new MailMessage)
            ->subject(__('mail.password_reset_subject'))
            ->view('emails.password-reset', [
                'name' => $notifiable->name,
                'url' => route('password.reset', [
                    'token' => $this->token,
                    'email' => $notifiable->email,
                    'locale' => app()->getLocale(),
                ]),
                'expiry' => config('auth.passwords.users.expire'),
            ]);
    }
}
