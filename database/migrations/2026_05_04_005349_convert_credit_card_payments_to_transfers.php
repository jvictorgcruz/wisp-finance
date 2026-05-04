<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update existing records
        DB::table('transactions')
            ->where('type', 'CREDIT_CARD_PAYMENT')
            ->update(['type' => 'TRANSFER']);

        // 2. Redefine enum column (this is database specific, but using statement for clarity)
        // Since we are likely on MariaDB/MySQL (Sail default)
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('EXPENSE', 'INCOME', 'TRANSFER') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('EXPENSE', 'INCOME', 'TRANSFER', 'CREDIT_CARD_PAYMENT') NOT NULL");
    }
};
