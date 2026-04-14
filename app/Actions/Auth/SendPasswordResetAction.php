<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Notifications\Auth\PasswordResetNotification;
use Illuminate\Support\Facades\Password;

class SendPasswordResetAction
{
    /**
     * Send a password reset link to the given user.
     *
     * @param array $data
     * @return string
     */
    public function execute(array $data): string
    {
        // Use Laravel's Password broker to handle token creation
        return Password::broker()->sendResetLink(
            ['email' => $data['email']],
            function (User $user, string $token) {
                $user->notify((new PasswordResetNotification($token))->locale(app()->getLocale()));
            }
        );
    }
}
