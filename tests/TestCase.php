<?php

namespace Tests;

use App\Models\Account;
use App\Models\User;
use App\Models\Ledger;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public ?User $user = null;
    public ?User $admin = null;
    public ?User $superAdmin = null;
    public ?Ledger $ledger = null;
    public $action;
    public $account;
    public $cardDetail;
    public $driver;
    public $data;
    public $bank;
    public $expenseCat;
    public $revenueCat;
    public ?Account $parentAccount = null;
    public ?Account $assetAccount = null;
    public ?Account $expenseAccount = null;
    public ?Account $revenueAccount = null;
    public $cardAccount;
    public $category;
    public $upsertAction;
    public $bankAccount;
    public $invoice;
    public $revenue;
    public $sourceAccount;
    public $balanceAction;
    public $cardParent;
    public $bankParent;
}
