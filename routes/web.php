<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    $locale = session('locale', request()->getPreferredLanguage(['en', 'pt']) ?: config('app.locale'));
    return redirect("/{$locale}/home");
});

Route::get('/home', function () {
    $locale = session('locale', request()->getPreferredLanguage(['en', 'pt']) ?: config('app.locale'));
    return redirect("/{$locale}/home");
});

Route::prefix('{locale}')->where(['locale' => 'en|pt'])->group(function () {
    Route::get('/home', fn() => Inertia::render('Home'))->name('home');
});

Route::middleware('guest')->group(function () {
    Route::middleware('check_maintenance')->group(function () {
        Route::prefix('{locale}')->where(['locale' => 'en|pt'])->group(function () {
            Route::get('register', [RegisteredUserController::class, 'create'])->name('register.locale');
            Route::post('register', [RegisteredUserController::class, 'store'])->name('register.store.locale');
        });

        Route::get('register', function () {
            $locale = session('locale', config('app.locale'));
            return redirect("/{$locale}/register");
        })->name('register');
    });

    Route::prefix('{locale}')->where(['locale' => 'en|pt'])->group(function () {
        Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login.locale');
        Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store.locale');
        Route::get('forgot-password', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'create'])->name('password.request.locale');
        Route::post('forgot-password', [\App\Http\Controllers\Auth\PasswordResetLinkController::class, 'store'])->name('password.email.locale');
        Route::get('reset-password/{token}', [\App\Http\Controllers\Auth\NewPasswordController::class, 'create'])->name('password.reset.locale');
        Route::post('reset-password', [\App\Http\Controllers\Auth\NewPasswordController::class, 'store'])->name('password.store.locale');
    });

    Route::get('login', function () {
        $locale = session('locale', config('app.locale'));
        return redirect("/{$locale}/login");
    })->name('login');

    Route::get('forgot-password', function () {
        $locale = session('locale', config('app.locale'));
        return redirect("/{$locale}/forgot-password");
    })->name('password.request');

    Route::get('reset-password/{token}', function ($token) {
        $locale = session('locale', config('app.locale'));
        return redirect()->route('password.reset.locale', [
            'locale' => $locale,
            'token' => $token,
            ...request()->query()
        ]);
    })->name('password.reset');
});

Route::middleware('check_maintenance')->group(function () {

    Route::middleware('auth')->group(function () {
        Route::get('dashboard', fn() => redirect()->route('accounts.index'))->name('dashboard');

        Route::resource('accounts', \App\Http\Controllers\AccountController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
        
        Route::post('language/{locale}', [\App\Http\Controllers\LanguageController::class, 'update'])->name('language.update');
    });

});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('feature-flags', [\App\Http\Controllers\FeatureFlagController::class, 'index'])->name('feature-flags.index');
    Route::post('feature-flags/clear-cache', [\App\Http\Controllers\FeatureFlagController::class, 'clearCache'])->name('feature-flags.clear-cache');
    
    Route::get('settings', [\App\Http\Controllers\Admin\SystemSettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [\App\Http\Controllers\Admin\SystemSettingController::class, 'update'])->name('settings.update');

    Route::middleware('super_admin')->group(function () {
        Route::get('users', [\App\Http\Controllers\Admin\UserRoleController::class, 'index'])->name('users.index');
        Route::patch('users/{user}/role', [\App\Http\Controllers\Admin\UserRoleController::class, 'update'])->name('users.update-role');
    });
});
