<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('soal', function (Blueprint $table) {
            $table->string('gambar_pertanyaan')->nullable()->after('pertanyaan');
            $table->string('gambar_a')->nullable()->after('pilihan_a');
            $table->string('gambar_b')->nullable()->after('pilihan_b');
            $table->string('gambar_c')->nullable()->after('pilihan_c');
            $table->string('gambar_d')->nullable()->after('pilihan_d');
            $table->string('gambar_e')->nullable()->after('pilihan_e');
            $table->string('gambar_pembahasan')->nullable()->after('pembahasan');
        });
    }

    public function down(): void
    {
        Schema::table('soal', function (Blueprint $table) {
            $table->dropColumn([
                'gambar_pertanyaan', 'gambar_a', 'gambar_b',
                'gambar_c', 'gambar_d', 'gambar_e', 'gambar_pembahasan',
            ]);
        });
    }
};
