<?php

namespace App\Exceptions;

use Exception;

class InconsistentJournalEntryException extends Exception
{
    public function __construct(int $debitSum, int $creditSum)
    {
        parent::__construct("Journal entries are unbalanced. Total Debit: {$debitSum}, Total Credit: {$creditSum}. Difference: " . ($debitSum - $creditSum));
    }
}
