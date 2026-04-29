<?php

use App\Models\User;
use App\Models\Ledger;
use App\Enums\UserRole;
use App\Support\FeatureFlags\Contracts\FeatureDriverInterface;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->user = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->ledger = Ledger::factory()->create();
    $this->user->ledgers()->attach($this->ledger->id, ['role' => 'owner']);

    $this->driver = Mockery::mock(FeatureDriverInterface::class);
    app()->instance(FeatureDriverInterface::class, $this->driver);
    
    // Default expectations for middlewares
    $this->driver->shouldReceive('allFlags')->byDefault()->andReturn([]);
    $this->driver->shouldReceive('isAvailable')->with('enable_app', Mockery::any())->byDefault()->andReturn(true);
});

test('feature flags index is protected', function () {
    $this->get(route('admin.feature-flags.index'))
        ->assertRedirect();
});

test('feature flags index renders correctly', function () {
    $this->driver->shouldReceive('getExpiresAt')->once()->andReturn(null);

    $this->actingAs($this->user)
        ->get(route('admin.feature-flags.index'))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('FeatureFlags/Index')
            ->has('flags')
            ->has('filters')
            ->has('expires_at')
        );
});

test('feature flags can be filtered by valid context', function () {
    $anotherUser = User::factory()->create(['email' => 'other@example.com']);
    $anotherLedger = Ledger::factory()->create();

    $this->driver->shouldReceive('allFlags')
        ->once()
        ->with(Mockery::on(fn ($context) => 
            $context->ledgerId === $anotherLedger->id && 
            $context->userEmail === 'other@example.com'
        ))
        ->andReturns(['flag' => true]);

    $this->driver->shouldReceive('getExpiresAt')->once()->andReturn(null);

    $this->actingAs($this->user)
        ->get(route('admin.feature-flags.index', [
            'ledger_id' => $anotherLedger->id,
            'user_email' => 'other@example.com'
        ]))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.ledger_id', (string) $anotherLedger->id)
            ->where('filters.user_email', 'other@example.com')
        );
});

test('filtering by invalid context returns validation errors', function () {
    $this->actingAs($this->user)
        ->get(route('admin.feature-flags.index', [
            'ledger_id' => 99999,
            'user_email' => 'not-exists@example.com'
        ]))
        ->assertSessionHasErrors(['ledger_id', 'user_email']);
});

test('clear cache flushes the correct tag', function () {
    Cache::shouldReceive('supportsTags')->andReturn(true);
    Cache::shouldReceive('tags')
        ->once()
        ->with(['feature_flags'])
        ->andReturns(Mockery::mock(['flush' => true]));

    $this->actingAs($this->user)
        ->post(route('admin.feature-flags.clear-cache'))
        ->assertRedirect()
        ->assertSessionHas('success');
});
