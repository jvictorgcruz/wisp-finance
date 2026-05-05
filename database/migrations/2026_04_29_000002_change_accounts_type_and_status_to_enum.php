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
         Schema::table('accounts', function (Blueprint $table) {
             $table->enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense'])->change();
             $table->enum('status', ['active', 'inactive'])->default('active')->change();
         });
     }
 
     /**
      * Reverse the migrations.
      */
     public function down(): void
     {
         Schema::table('accounts', function (Blueprint $table) {
             $table->string('type')->change();
             $table->string('status')->default('active')->change();
         });
     }
 };
