<?php

namespace Database\Seeders;

use App\Actions\Accounts\UpsertAccountAction;
use App\Actions\Transactions\RecordExpenseAction;
use App\Actions\Transactions\RecordIncomeAction;
use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ScreenshotSeeder extends Seeder
{
    /**
     * Run the database seeds for beautiful screenshots using business Actions.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        if (!$user) return;

        $ledger = $user->ledgers()->first();
        if (!$ledger) return;

        // Set context to avoid scope issues during seeding by logging in the user
        \Illuminate\Support\Facades\Auth::login($user);

        DB::transaction(function () use ($ledger) {
            // 1. Cleanup existing data
            Transaction::where('ledger_id', $ledger->id)->delete();
            \App\Models\CreditCardInvoice::whereHas('creditCardDetail', function($q) use ($ledger) {
                 $q->whereHas('account', function($sq) use ($ledger) {
                     $sq->where('ledger_id', $ledger->id);
                 });
            })->delete();

            // Actions Instances
            $upsertAccount = app(UpsertAccountAction::class);
            $recordIncome = app(RecordIncomeAction::class);
            $recordExpense = app(RecordExpenseAction::class);

            // 2. Setup Premium Accounts via Actions
            $bankRoot = Account::where('ledger_id', $ledger->id)->where('type', AccountType::ASSET)->where('name', 'accounts.bank')->first();
            $ccRoot = Account::where('ledger_id', $ledger->id)->where('type', AccountType::LIABILITY)->where('name', 'accounts.credit_card')->first();

            $nubank = Account::where('ledger_id', $ledger->id)->where('name', 'Nubank Corrente')->first();
            $nubank = $upsertAccount->execute([
                'ledger_id' => $ledger->id,
                'name' => 'Nubank Corrente',
                'parent_id' => $bankRoot->id,
                'type' => AccountType::ASSET,
                'ui_metadata' => ['icon' => 'CircleDollarSign', 'color' => '#8338ec']
            ], $nubank);

            $inter = Account::where('ledger_id', $ledger->id)->where('name', 'Inter Investimentos')->first();
            $inter = $upsertAccount->execute([
                'ledger_id' => $ledger->id,
                'name' => 'Inter Investimentos',
                'parent_id' => $bankRoot->id,
                'type' => AccountType::ASSET,
                'ui_metadata' => ['icon' => 'TrendingUp', 'color' => '#ff5400']
            ], $inter);

            $nubankCC = Account::where('ledger_id', $ledger->id)->where('name', 'Nubank Ultravioleta')->first();
            $nubankCC = $upsertAccount->execute([
                'ledger_id' => $ledger->id,
                'name' => 'Nubank Ultravioleta',
                'parent_id' => $ccRoot->id,
                'is_credit_card' => true,
                'ui_metadata' => ['icon' => 'CreditCard', 'color' => '#8338ec'],
                'credit_card_details' => [
                    'limit' => 1200000, // R$ 12.000,00
                    'closing_day' => 5,
                    'due_day' => 12,
                    'invoice_control_enabled' => true,
                ]
            ], $nubankCC);

            // 3. Find Categories
            $salaryCat = Account::where('ledger_id', $ledger->id)->where('name', __('categories.base_salary'))->first();
            $rentCat = Account::where('ledger_id', $ledger->id)->where('name', __('categories.rent'))->first();
            $marketCat = Account::where('ledger_id', $ledger->id)->where('name', __('categories.market'))->first();
            $restaurantCat = Account::where('ledger_id', $ledger->id)->where('name', __('categories.restaurants'))->first();
            $cinemaCat = Account::where('ledger_id', $ledger->id)->where('name', __('categories.cinema'))->first();
            $equityRoot = Account::where('ledger_id', $ledger->id)->where('type', AccountType::EQUITY)->first();

            // 4. Populate Transactions (Current Month)
            $now = Carbon::now();
            $monthStart = $now->copy()->startOfMonth();

            $monthName = ucfirst($monthStart->locale('pt')->translatedFormat('F'));
            $this->createManualTransaction($ledger, $monthStart->copy(), "Saldo Inicial de {$monthName}", 1500000, TransactionType::INCOME, $equityRoot, $nubank);
            
            // Incomes via Action
            $recordIncome->execute($salaryCat, $nubank, 925000, $monthStart->copy()->addDays(4), 'Salário Mensal - Tech Corp');
            $recordIncome->execute($salaryCat, $nubank, 180000, $monthStart->copy()->addDays(15), 'Freelance UI Design');

            // Fixed Expenses via Action
            $recordExpense->execute($nubank, $rentCat, 220000, $monthStart->copy()->addDays(5), 'Aluguel Loft Pinheiros');
            $recordExpense->execute($nubank, $rentCat, 85000, $monthStart->copy()->addDays(6), 'Condomínio e IPTU');

            // Variable Expenses (Checking)
            $recordExpense->execute($nubank, $marketCat, 42000, $monthStart->copy()->addDays(7), 'Supermercado St. Marche');
            $recordExpense->execute($nubank, $marketCat, 28500, $monthStart->copy()->addDays(12), 'Abastecimento Shell');

            // Credit Card Purchases (Current Invoice)
            $recordExpense->execute($nubankCC, $marketCat, 5590, $monthStart->copy()->addDays(8), 'Netflix Premium');
            $recordExpense->execute($nubankCC, $restaurantCat, 31200, $monthStart->copy()->addDays(10), 'Jantar Outback Steakhouse');
            $recordExpense->execute($nubankCC, $cinemaCat, 9800, $monthStart->copy()->addDays(12), 'Ingresso.com - Avatar 2');
            $recordExpense->execute($nubankCC, $marketCat, 3490, $monthStart->copy()->addDays(14), 'Apple Store - iCloud 2TB');

            // One purchase from previous month
            $recordExpense->execute($nubankCC, $cinemaCat, 45000, $monthStart->copy()->subDays(5), 'Reserva Hotéis.com');

            // Installment Purchase - SHOWING THE POWER OF ACTIONS
            $recordExpense->execute(
                $nubankCC, 
                $marketCat, 
                600000, 
                $monthStart->copy()->addDays(2), 
                'iPhone 15 Pro Max', 
                [], 
                10 // 10 installments!
            );

            // 6. Clear Cache to ensure Dashboard reflects new data immediately
            \Illuminate\Support\Facades\Cache::flush();
        });
    }

    /**
     * Manual transaction for special cases like Opening Balance that don't fit standard Income/Expense actions.
     */
    private function createManualTransaction($ledger, $date, $description, $amount, $type, $fromAccount, $toAccount)
    {
        $transaction = Transaction::create([
            'ledger_id' => $ledger->id,
            'date' => $date,
            'description' => $description,
            'type' => $type,
            'status' => TransactionStatus::ACTIVE,
            'created_by_user_id' => auth()->id(),
        ]);

        JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $fromAccount->id,
            'type' => 'CREDIT',
            'amount' => $amount,
            'entry_date' => $date,
        ]);

        JournalEntry::create([
            'transaction_id' => $transaction->id,
            'account_id' => $toAccount->id,
            'type' => 'DEBIT',
            'amount' => $amount,
            'entry_date' => $date,
        ]);

        \App\Models\ExpectedCashFlow::create([
            'transaction_id' => $transaction->id,
            'account_id' => $toAccount->id,
            'amount' => $amount,
            'due_date' => $date,
            'status' => 'PAID',
        ]);

        return $transaction;
    }
}
