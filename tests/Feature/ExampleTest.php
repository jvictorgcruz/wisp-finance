<?php

test('the application returns a successful response', function () {
    $response = $this->get('/en/home');

    $response->assertStatus(200);
});
