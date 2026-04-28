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
    public function store(\App\Http\Requests\RegisterUserRequest $request, RegisterUserAction $registerUserAction): RedirectResponse
    {
        $user = $registerUserAction->execute($request->validated());

        Auth::login($user);

        // Redirect to home/root as fallback since we don't have dashboard yet
        return redirect()->intended('/');
    }
}
