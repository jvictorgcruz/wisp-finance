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
            $table->dropColumn('description');
            $table->unsignedSmallInteger('installment_number')->nullable()->after('due_date');
            $table->unsignedSmallInteger('installment_total')->nullable()->after('installment_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expected_cash_flows', function (Blueprint $table) {
            $table->dropColumn(['installment_number', 'installment_total']);
            $table->string('description')->nullable()->after('due_date');
        });
    }
};
