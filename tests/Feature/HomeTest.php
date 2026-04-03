<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the home page correctly via inertia', function () {
    $this->get('/en/home')
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Home')
        );
});
