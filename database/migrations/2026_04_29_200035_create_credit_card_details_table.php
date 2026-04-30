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
        Schema::create('credit_card_details', function (Blueprint $table) {
            $table->id();
            // FK to accounts - unique for One-to-One relationship
            $table->foreignId('account_id')->unique()->constrained()->cascadeOnDelete();
            
            // Financial limit in cents
            $table->bigInteger('limit')->default(0);
            
            // Closing and Due days (1-31)
            $table->unsignedSmallInteger('closing_day');
            $table->unsignedSmallInteger('due_day');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for faster lookups
            $table->index('account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_card_details');
    }
};
