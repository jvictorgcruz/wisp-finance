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

test('factory can create an account on the fly', function () {
    $details = CreditCardDetail::factory()->create();

    expect($details->account)->toBeInstanceOf(Account::class);
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
