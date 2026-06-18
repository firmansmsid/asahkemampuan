<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_commissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('referrer_id');      // user yang mengundang
            $table->unsignedBigInteger('referred_id');      // user yang diundang
            $table->unsignedBigInteger('payment_id');       // payment yang memicu komisi
            $table->decimal('payment_amount', 12, 0);       // jumlah pembayaran
            $table->decimal('commission_pct', 5, 2);        // % komisi saat itu
            $table->decimal('commission_amount', 12, 0);    // jumlah komisi
            $table->string('status')->default('pending');    // pending, paid, cancelled
            $table->timestamps();

            $table->foreign('referrer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('referred_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('payment_id')->references('id')->on('payments')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_commissions');
    }
};
