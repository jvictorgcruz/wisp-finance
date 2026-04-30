<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case ACTIVE = 'ACTIVE';
    case REVERSED = 'REVERSED';
}
