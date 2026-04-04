<?php

use App\Models\User;
use Illuminate\Support\Facades\App;

test('i18n is correctly applied to accounts page for authenticated users', function () {
    // 1. Setup user with Portuguese preference
    $user = User::factory()->create(['locale' => 'pt']);
    
    // 2. Access accounts page and verify Portuguese translations
    $this->actingAs($user)
        ->withSession(['locale' => 'pt'])
        ->get('/accounts')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Accounts/Index')
            ->where('locale', 'pt')
            ->where('translations.home.nav.accounts', 'Contas')
            // Estas chaves devem falhar se não existirem no lang/pt.json
            ->has('translations.accounts.page.title')
            ->has('translations.accounts.page.empty_title')
        );

    // 3. Change language to English
    $this->actingAs($user)
        ->post('/language/en')
        ->assertRedirect();
    
    $user->refresh();
    expect($user->locale)->toBe('en');

    // 4. Access accounts page again and verify English translations
    $this->actingAs($user)
        ->get('/accounts')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Accounts/Index')
            ->where('locale', 'en')
            ->where('translations.home.nav.accounts', 'Accounts')
            ->where('translations.accounts.page.title', 'Accounts')
        );
});

test('sidebar specific keys are correctly shared', function () {
    $user = User::factory()->create(['locale' => 'pt']);
    
    $this->actingAs($user)
        ->get('/accounts')
        ->assertInertia(fn ($page) => $page
            // Verificando a hierarquia que identifiquei como problemática (home.sidebar vs sidebar)
            ->has('translations.home.sidebar.current_ledger')
        );
});
