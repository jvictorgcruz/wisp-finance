<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\RegisterUserAction;
use App\Http\Controllers\Controller;
use App\Support\Settings\SettingManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DemoController extends Controller
{
    /**
     * Create a demo user, log them in, and redirect to dashboard.
     */
    public function store(Request $request, RegisterUserAction $registerUserAction): RedirectResponse
    {
        if (!SettingManager::isActive('demo_mode')) {
            abort(403, __('auth.demo_mode_disabled'));
        }

        $uuid = (string) Str::uuid();
        $email = "demo-{$uuid}@wisp.test";
        $password = Str::random(32);
        $name = __('auth.demo_user_name');

        $user = $registerUserAction->execute([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'is_demo' => true,
            'has_seen_welcome_modal' => false,
        ]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
