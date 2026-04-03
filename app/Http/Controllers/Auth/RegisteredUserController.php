<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\RegisterUserAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, RegisterUserAction $registerUserAction): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:\App\Models\User',
            'password' => 'required|confirmed|min:8',
        ]);

        $user = $registerUserAction->execute($request->only('name', 'email', 'password'));

        Auth::login($user);

        // Set current ledger in session
        $ledger = $user->currentLedger();
        if ($ledger) {
            session(['current_ledger_id' => $ledger->id]);
        }

        // Redirect to home/root as fallback since we don't have dashboard yet
        return redirect()->intended('/');
    }
}
