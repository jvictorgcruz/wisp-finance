<?php

use Inertia\Testing\AssertableInertia as Assert;

test('landing page is accessible and renders home component', function () {
    $this->get('/')
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
        );
});

test('landing page shows dashboard button when authenticated', function () {
    $user = \App\Models\User::factory()->create();
    $ledger = \App\Models\Ledger::factory()->create();
    $user->ledgers()->attach($ledger, ['role' => 'owner']);

    $this->actingAs($user)
        ->get('/')
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->where('auth.user.id', $user->id)
        );
});
