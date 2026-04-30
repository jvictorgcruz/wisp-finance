<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('created_by_user_id')->nullable()->after('ledger_id')->constrained('users')->nullOnDelete();
            
            $table->enum('type', ['EXPENSE', 'INCOME', 'TRANSFER', 'CREDIT_CARD_PAYMENT'])
                ->after('date')
                ->index();
            
            $table->enum('status', ['ACTIVE', 'REVERSED'])
                ->default('ACTIVE')
                ->after('type')
                ->index();
            
            $table->foreignId('reversed_by_id')
                ->nullable()
                ->after('status')
                ->constrained('transactions')
                ->nullOnDelete();
                
            $table->foreignId('reverses_id')
                ->nullable()
                ->after('reversed_by_id')
                ->constrained('transactions')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by_user_id');
            $table->dropConstrainedForeignId('reversed_by_id');
            $table->dropConstrainedForeignId('reverses_id');
            $table->dropColumn(['type', 'status']);
        });
    }
};
