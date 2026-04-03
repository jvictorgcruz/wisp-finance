<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;

// Root fallback
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    $locale = session('locale', request()->getPreferredLanguage(['en', 'pt']) ?: config('app.locale'));
    return redirect("/{$locale}/home");
});

// Explicit /home route goes to the locale hero page regardless of auth state
Route::get('/home', function () {
    $locale = session('locale', request()->getPreferredLanguage(['en', 'pt']) ?: config('app.locale'));
    return redirect("/{$locale}/home");
});

// Authenticated dashboard redirect
Route::get('/dashboard', function () {
    return redirect()->route('accounts.index');
})->middleware('auth')->name('dashboard');

// Localized home page (accessible by both guests and authenticated users)
Route::prefix('{locale}')->where(['locale' => 'en|pt'])->group(function () {
    Route::get('/home', fn() => Inertia::render('Home'))->name('home');
});

// Guest-only routes
Route::middleware('guest')->group(function () {
    
    // Localized login/register views
    Route::prefix('{locale}')->where(['locale' => 'en|pt'])->group(function () {
        Route::get('register', [RegisteredUserController::class, 'create'])->name('register.locale');
        Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login.locale');
    });

    // Fallback login/register
    Route::get('login', function () {
        $locale = session('locale', config('app.locale'));
        return redirect("/{$locale}/login");
    })->name('login');

    Route::get('register', function () {
        $locale = session('locale', config('app.locale'));
        return redirect("/{$locale}/register");
    })->name('register');

    // Authentication actions
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::get('accounts', fn() => Inertia::render('Accounts/Index'))->name('accounts.index');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    
    Route::post('language/{locale}', [\App\Http\Controllers\LanguageController::class, 'update'])->name('language.update');
});
