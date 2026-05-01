<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Ledger;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the official test user
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Wisp Test User',
                'password' => Hash::make('password'),
                'locale' => 'pt',
                'role' => UserRole::SUPER_ADMIN,
            ]
        );

        \Illuminate\Support\Facades\App::setLocale($user->locale);

        // Create a default ledger for the user if it doesn't exist
        $ledger = Ledger::firstOrCreate(
            ['name' => 'Personal Ledger'],
            [
                'slug' => 'personal-ledger',
                'created_at' => now(),
            ]
        );

        // Ensure user is attached to the ledger
        if (!$user->ledgers()->where('ledger_id', $ledger->id)->exists()) {
            $user->ledgers()->attach($ledger->id);
        }

        // Set the current ledger for the user session simulation
        $user->update(['current_ledger_id' => $ledger->id]);

        // Delegate account population to LedgerSeeder
        $this->callWith(LedgerSeeder::class, ['ledger' => $ledger]);
    }
}
