<?php

namespace Tests;

use App\Models\User;
use App\Models\Ledger;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public ?User $user = null;
    public ?Ledger $ledger = null;
}
