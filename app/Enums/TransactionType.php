<?php

namespace App\Enums;

enum TransactionType: string
{
    case EXPENSE = 'EXPENSE';
    case INCOME = 'INCOME';
    case TRANSFER = 'TRANSFER';
    case CREDIT_CARD_PAYMENT = 'CREDIT_CARD_PAYMENT';
}
