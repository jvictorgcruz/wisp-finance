<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

test('it can connect to the database', function () {
    $results = DB::select('SELECT 1');
    expect($results)->not->toBeEmpty();
});

test('it can connect to redis', function () {
    $response = Redis::ping();
    expect($response)->toBeTrue();
});
