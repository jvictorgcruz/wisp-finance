<?php

namespace Database\Seeders;

use App\Models\Ledger;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Enums\AccountType;
use App\Enums\AccountStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountBalanceSeeder extends Seeder
{
    /**
     * Inject initial balances and transactions for a ledger.
     * Searches for accounts using their static translation keys.
     */
    public function run(Ledger $ledger): void
    {
        // 1. Identify the root EQUITY account via its key
        $openingBalanceRoot = Account::where('ledger_id', $ledger->id)
            ->where('type', AccountType::EQUITY)
            ->where('name', 'accounts.opening_balance')
            ->first();

        // 2. Identify the root ASSET account via its key
        $bankRoot = Account::where('ledger_id', $ledger->id)
            ->where('type', AccountType::ASSET)
            ->where('name', 'accounts.bank')
            ->first();

        if (!$openingBalanceRoot || !$bankRoot) {
            return;
        }

        DB::transaction(function () use ($ledger, $openingBalanceRoot, $bankRoot) {
            $checkingAccount = Account::where('ledger_id', $ledger->id)
                ->where('parent_id', $bankRoot->id)
                ->where('name', __('accounts.checking_account'))
                ->first();

            if (!$checkingAccount) {
                return;
            }

            // Create an opening balance transaction
            $transaction = \App\Models\Transaction::create([
                'ledger_id' => $ledger->id,
                'date' => now()->subDays(10),
                'description' => 'Opening Balance',
                'type' => \App\Enums\TransactionType::INCOME,
                'status' => \App\Enums\TransactionStatus::ACTIVE,
            ]);

            // 4. Create Journal Entries (Balanced: Equity Root Credit <-> Asset Child Debit)
            
            // Total Starting Assets (R$ 10.000,00)
            JournalEntry::create([
                'transaction_id' => $transaction->id,
                'account_id' => $openingBalanceRoot->id,
                'type' => 'CREDIT',
                'amount' => 1000000,
                'entry_date' => now()->subDays(10),
            ]);

            JournalEntry::create([
                'transaction_id' => $transaction->id,
                'account_id' => $checkingAccount->id,
                'type' => 'DEBIT',
                'amount' => 1000000,
                'entry_date' => now()->subDays(10),
            ]);
        });
    }
}
