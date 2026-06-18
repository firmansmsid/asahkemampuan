<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add verification fields to soal table
        Schema::table('soal', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('bobot')->constrained('users')->nullOnDelete();
            $table->enum('verification_status', ['draft', 'verified', 'rejected'])->default('verified')->after('created_by');
            $table->foreignId('verified_by')->nullable()->after('verification_status')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by');
            $table->text('rejection_note')->nullable()->after('verified_at');
        });

        // Add soal_commission_pct to users table
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('soal_commission_pct', 5, 2)->default(5.00)->after('referral_commission_pct');
        });

        // Update role check constraint to include new roles
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text = ANY(ARRAY['admin','peserta','pembuat_soal','verifikator']::text[]))");

        // Create soal_commissions table to track pembuat soal earnings
        Schema::create('soal_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pembuat_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('paket_id')->constrained('paket_tryout')->cascadeOnDelete();
            $table->integer('soal_count')->default(0); // how many soal by this pembuat in the paket
            $table->integer('total_soal_paket')->default(0); // total soal in the paket
            $table->decimal('payment_amount', 12, 0)->default(0);
            $table->decimal('commission_pct', 5, 2)->default(0);
            $table->decimal('commission_amount', 12, 0)->default(0);
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soal_commissions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('soal_commission_pct');
        });

        Schema::table('soal', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['created_by', 'verification_status', 'verified_by', 'verified_at', 'rejection_note']);
        });
    }
};
