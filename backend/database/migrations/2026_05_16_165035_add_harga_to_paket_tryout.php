<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paket_tryout', function (Blueprint $table) {
            $table->decimal('harga', 12, 0)->default(0)->after('is_gratis');
        });
    }

    public function down(): void
    {
        Schema::table('paket_tryout', function (Blueprint $table) {
            $table->dropColumn('harga');
        });
    }
};
