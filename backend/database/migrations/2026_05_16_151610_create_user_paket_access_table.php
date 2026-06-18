<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_paket_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('paket_id')->constrained('paket_tryout')->onDelete('cascade');
            $table->timestamp('granted_at')->useCurrent();
            $table->timestamps();
            $table->unique(['user_id', 'paket_id']);
        });

        // Add access_mode to paket_tryout: 'publik' (everyone) or 'terbatas' (only assigned users)
        Schema::table('paket_tryout', function (Blueprint $table) {
            $table->string('access_mode')->default('publik'); // publik or terbatas
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_paket_access');
        Schema::table('paket_tryout', function (Blueprint $table) {
            $table->dropColumn('access_mode');
        });
    }
};
