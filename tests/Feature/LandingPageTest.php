<?php

use Inertia\Testing\AssertableInertia as Assert;

test('root url redirects guest user to localized home route', function () {
    $this->get('/')
        ->assertRedirect('/en/home');
});

test('root url redirects authenticated user to dashboard route', function () {
    $user = \App\Models\User::factory()->create();
    $ledger = \App\Models\Ledger::factory()->create();
    $user->ledgers()->attach($ledger, ['role' => 'owner']);

    $this->actingAs($user)
        ->get('/')
        ->assertRedirect('/dashboard');
});

test('guest can view home page in english and portuguese', function () {
    $this->get('/en/home')
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->where('auth.user', null)
        );

    $this->get('/pt/home')
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->where('auth.user', null)
        );
});

test('authenticated user viewing home page gets authenticated inertia props', function () {
    $user = \App\Models\User::factory()->create();
    $ledger = \App\Models\Ledger::factory()->create();
    $user->ledgers()->attach($ledger, ['role' => 'owner']);

    $this->actingAs($user)
        ->get('/en/home')
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->where('auth.user.id', $user->id)
        );
});
