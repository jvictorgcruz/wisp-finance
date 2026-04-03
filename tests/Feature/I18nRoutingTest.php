<?php

use App\Models\User;
use Illuminate\Support\Facades\Session;

test('root redirects to default locale when no preference is set', function () {
    $response = $this->get('/');
    $response->assertRedirect('/en/home');
});

test('root redirects to preferred browser language', function () {
    $response = $this->get('/', [
        'Accept-Language' => 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    ]);
    
    $response->assertRedirect('/pt/home');
});

test('guest routes are accessible with locale prefix', function () {
    $this->get('/en/login')->assertStatus(200);
    $this->get('/pt/login')->assertStatus(200);
    $this->get('/en/register')->assertStatus(200);
    $this->get('/pt/register')->assertStatus(200);
});

test('unsupported locales return 404', function () {
    $this->get('/fr/login')->assertStatus(404);
    $this->get('/es/register')->assertStatus(404);
});

test('authenticated user locale is saved and persisted', function () {
    $user = User::factory()->create(['locale' => 'en']);
    
    $this->actingAs($user)
        ->post('/language/pt')
        ->assertRedirect();
        
    $user->refresh();
    expect($user->locale)->toBe('pt');
    expect(session('locale'))->toBe('pt');
});

test('inertia shares correct translations based on locale', function () {
    // Test English
    $response = $this->get('/en/home');
    $response->assertInertia(fn ($page) => $page
        ->where('locale', 'en')
        ->has('translations.home.title')
    );

    // Test Portuguese
    $response = $this->get('/pt/home');
    $response->assertInertia(fn ($page) => $page
        ->where('locale', 'pt')
        ->has('translations.home.title')
    );
});
