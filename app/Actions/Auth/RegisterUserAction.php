<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Models\Ledger;
use App\Actions\Ledgers\CreateDefaultAccountsAction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterUserAction
{
    /**
     * Create a new RegisterUserAction instance.
     */
    public function __construct(
        protected CreateDefaultAccountsAction $createDefaultAccountsAction
    ) {}

    /**
     * Register a new user and create their initial ledger and accounts.
     */
    public function execute(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $ledger = Ledger::create([
                'name' => "Carteira de " . $user->name,
                'slug' => Str::slug($user->name . '-' . Str::random(5)),
            ]);

            $ledger->users()->attach($user, ['role' => 'owner']);

            $this->createDefaultAccountsAction->execute($ledger);

            return $user;
        });
    }
}
