<?php

use App\Models\Account;
use App\Models\CreditCardDetail;
use App\Models\Ledger;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it has a one-to-one relationship with account', function () {
    $account = Account::factory()->create();
    $details = CreditCardDetail::factory()->create(['account_id' => $account->id]);

    expect($account->creditCardDetail)->toBeInstanceOf(CreditCardDetail::class);
    expect($account->creditCardDetail->id)->toBe($details->id);
    expect($details->account)->toBeInstanceOf(Account::class);
    expect($details->account->id)->toBe($account->id);
});

test('it is scoped by ledger_id', function () {
    $ledger1 = Ledger::factory()->create();
    $ledger2 = Ledger::factory()->create();

    $account1 = Account::factory()->create(['ledger_id' => $ledger1->id]);
    $details1 = CreditCardDetail::factory()->create([
        'account_id' => $account1->id,
        'ledger_id' => $ledger1->id
    ]);

    $account2 = Account::factory()->create(['ledger_id' => $ledger2->id]);
    $details2 = CreditCardDetail::factory()->create([
        'account_id' => $account2->id,
        'ledger_id' => $ledger2->id
    ]);

    // Create users for each ledger
    $user1 = \App\Models\User::factory()->create();
    $ledger1->users()->attach($user1, ['role' => 'owner']);

    $user2 = \App\Models\User::factory()->create();
    $ledger2->users()->attach($user2, ['role' => 'owner']);

    // Act as User 1
    Auth::login($user1);
    expect(CreditCardDetail::count())->toBe(1);
    expect(CreditCardDetail::first()->id)->toBe($details1->id);
    Auth::logout();

    // Act as User 2
    Auth::login($user2);
    expect(CreditCardDetail::count())->toBe(1);
    expect(CreditCardDetail::first()->id)->toBe($details2->id);
    Auth::logout();
});

test('factory can create an account on the fly', function () {
    $details = CreditCardDetail::factory()->create();

    expect($details->account)->toBeInstanceOf(Account::class);
    expect($details->ledger_id)->toBe($details->account->ledger_id);
});

test('it soft deletes when account is soft deleted', function () {
    $details = CreditCardDetail::factory()->create();
    $account = $details->account;

    $account->delete();

    expect($account->fresh()->trashed())->toBeTrue();
    expect($details->fresh()->trashed())->toBeTrue();
});

test('it restores when account is restored', function () {
    $details = CreditCardDetail::factory()->create();
    $account = $details->account;

    $account->delete();
    expect($details->fresh()->trashed())->toBeTrue();

    $account->restore();
    expect($details->fresh()->trashed())->toBeFalse();
});

test('it force deletes when account is force deleted', function () {
    $details = CreditCardDetail::factory()->create();
    $account = $details->account;

    $account->forceDelete();

    $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
    $this->assertDatabaseMissing('credit_card_details', ['id' => $details->id]);
});
