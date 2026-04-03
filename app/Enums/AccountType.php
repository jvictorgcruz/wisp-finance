<?php

namespace App\Enums;

enum AccountType: string
{
    case ASSET = 'asset';
    case LIABILITY = 'liability';
    case REVENUE = 'revenue';
    case EXPENSE = 'expense';
    case EQUITY = 'equity';
}
