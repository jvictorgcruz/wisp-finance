<?php

use App\Models\User;
use App\Models\Account;
use App\Models\Ledger;
use App\Models\Transaction;
use App\Enums\UserRole;
use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Actions\Categories\DeleteCategoryAction;
use App\Actions\Admin\UpdateUserRoleAction;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    /** @var \Tests\TestCase $this */
    $this->ledger = Ledger::factory()->create();
    $this->admin = User::factory()->create([
        'role' => UserRole::ADMIN,
        'current_ledger_id' => $this->ledger->id
    ]);
    $this->admin->ledgers()->attach($this->ledger->id, ['role' => UserRole::ADMIN]);
});

test('admin can access audit logs', function () {
    $response = $this->actingAs($this->admin)->get(route('admin.audit-log.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Admin/AuditLog/Index'));
});

test('regular user cannot access audit logs', function () {
    $user = User::factory()->create(['role' => UserRole::USER]);

    $response = $this->actingAs($user)->get(route('admin.audit-log.index'));

    $response->assertStatus(403);
});

test('account creation uses semantic descriptions', function () {
    $this->actingAs($this->admin);

    // Test bank account
    $account = Account::create([
        'ledger_id' => $this->ledger->id,
        'name' => 'Bank',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);
    $this->assertDatabaseHas('activity_log', ['description' => 'account.created', 'subject_id' => $account->id]);

    // Test credit card
    $card = Account::create([
        'ledger_id' => $this->ledger->id,
        'name' => 'Card',
        'type' => AccountType::LIABILITY,
        'is_credit_card' => true,
        'status' => AccountStatus::ACTIVE,
    ]);
    $this->assertDatabaseHas('activity_log', ['description' => 'credit_card.created', 'subject_id' => $card->id]);

    // Test category
    $cat = Account::create([
        'ledger_id' => $this->ledger->id,
        'name' => 'Food',
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
    ]);
    $this->assertDatabaseHas('activity_log', ['description' => 'category.created', 'subject_id' => $cat->id]);
});

test('account update is logged', function () {
    $account = Account::create([
        'ledger_id' => $this->ledger->id,
        'name' => 'Old Name',
        'type' => AccountType::ASSET,
        'status' => AccountStatus::ACTIVE,
    ]);

    $this->actingAs($this->admin);
    $account->update(['name' => 'New Name']);

    $this->assertDatabaseHas('activity_log', [
        'description' => 'account.updated',
        'subject_type' => Account::class,
        'subject_id' => $account->id,
        'ledger_id' => $this->ledger->id,
    ]);

    $activity = Activity::where('subject_id', $account->id)->where('description', 'account.updated')->first();
    expect($activity->properties['attributes']['name'])->toBe('New Name');
    expect($activity->properties['old']['name'])->toBe('Old Name');
});

test('category inactivation manual log', function () {
    $category = Account::factory()->create([
        'ledger_id' => $this->ledger->id,
        'type' => AccountType::EXPENSE,
        'status' => AccountStatus::ACTIVE,
        'parent_id' => Account::factory()->create(['ledger_id' => $this->ledger->id])->id,
    ]);
    
    $transaction = Transaction::factory()->create(['ledger_id' => $this->ledger->id]);

    // Mock historical transactions to force inactivation
    $category->journalEntries()->create([
        'ledger_id' => $this->ledger->id,
        'entry_date' => now(),
        'amount' => 1000,
        'description' => 'Test',
        'type' => 'DEBIT',
        'transaction_id' => $transaction->id 
    ]);

    $this->actingAs($this->admin);
    app(DeleteCategoryAction::class)->execute($category);

    $this->assertDatabaseHas('activity_log', [
        'description' => 'category.inactivated',
        'subject_id' => $category->id,
        'ledger_id' => $this->ledger->id,
    ]);
});

test('user role change manual log', function () {
    $targetUser = User::factory()->create(['role' => UserRole::USER]);

    $this->actingAs($this->admin);
    app(UpdateUserRoleAction::class)->execute($targetUser, UserRole::ADMIN->value);

    $this->assertDatabaseHas('activity_log', [
        'description' => 'user.role_changed',
        'subject_id' => $targetUser->id,
    ]);
});

test('audit logs are scoped to ledger', function () {
    // Clear all previous logs to have a clean state for this test
    Activity::truncate();

    $otherLedger = Ledger::factory()->create();
    
    // Create a log in another ledger
    Activity::create([
        'log_name' => 'domain',
        'description' => 'other log',
        'ledger_id' => $otherLedger->id,
        'properties' => [],
    ]);

    // Create a log in current ledger
    Activity::create([
        'log_name' => 'domain',
        'description' => 'current log',
        'ledger_id' => $this->ledger->id,
        'properties' => [],
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.audit-log.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->has('logs.data', 1)
        ->where('logs.data.0.description', 'current log')
    );
});
