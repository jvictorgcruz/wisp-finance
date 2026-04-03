<?php

use App\Models\Workspace;
use App\Models\User;
use App\Models\Account;

test('it can create a workspace', function () {
    $workspace = Workspace::create([
        'name' => 'Wisp Corp',
        'slug' => 'wisp-corp',
    ]);

    expect($workspace->name)->toBe('Wisp Corp');
    expect($workspace->slug)->toBe('wisp-corp');
});

test('workspace belongs to many users', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    
    $workspace->users()->attach($user, ['role' => 'owner']);

    expect($workspace->users)->toHaveCount(1);
    expect($workspace->users->first()->pivot->role)->toBe('owner');
});

test('workspace has many accounts', function () {
    $workspace = Workspace::factory()->create();
    Account::factory()->count(3)->create(['workspace_id' => $workspace->id]);

    expect($workspace->accounts)->toHaveCount(3);
});
