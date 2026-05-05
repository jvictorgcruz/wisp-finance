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
        Schema::table('expected_cash_flows', function (Blueprint $table) {
            $table->foreignId('credit_card_invoice_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expected_cash_flows', function (Blueprint $table) {
            $table->dropConstrainedForeignId('credit_card_invoice_id');
        });
    }
};
