<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kategori', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->text('deskripsi')->nullable();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('paket_tryout', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('cascade');
            $table->string('judul');
            $table->string('slug')->unique();
            $table->text('deskripsi')->nullable();
            $table->integer('durasi')->default(90); // menit
            $table->integer('jumlah_soal')->default(50);
            $table->integer('passing_grade')->default(70);
            $table->boolean('is_gratis')->default(true);
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->string('thumbnail')->nullable();
            $table->timestamps();
        });

        Schema::create('soal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('cascade');
            $table->text('pertanyaan');
            $table->text('pilihan_a');
            $table->text('pilihan_b');
            $table->text('pilihan_c');
            $table->text('pilihan_d');
            $table->text('pilihan_e')->nullable();
            $table->enum('kunci_jawaban', ['A', 'B', 'C', 'D', 'E']);
            $table->text('pembahasan')->nullable();
            $table->integer('bobot')->default(1);
            $table->timestamps();
        });

        Schema::create('paket_soal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paket_id')->constrained('paket_tryout')->onDelete('cascade');
            $table->foreignId('soal_id')->constrained('soal')->onDelete('cascade');
            $table->integer('urutan')->default(0);
            $table->unique(['paket_id', 'soal_id']);
        });

        Schema::create('sesi_ujian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('paket_id')->constrained('paket_tryout')->onDelete('cascade');
            $table->enum('status', ['berlangsung', 'selesai', 'timeout'])->default('berlangsung');
            $table->timestamp('mulai_at')->useCurrent();
            $table->timestamp('selesai_at')->nullable();
            $table->integer('waktu_tersisa'); // detik
            $table->timestamps();

            $table->index(['user_id', 'paket_id']);
        });

        Schema::create('jawaban_ujian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('sesi_ujian')->onDelete('cascade');
            $table->foreignId('soal_id')->constrained('soal')->onDelete('cascade');
            $table->enum('jawaban', ['A', 'B', 'C', 'D', 'E'])->nullable();
            $table->boolean('is_benar')->nullable();
            $table->timestamps();

            $table->unique(['sesi_id', 'soal_id']);
        });

        Schema::create('hasil_tryout', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('sesi_ujian')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('paket_id')->constrained('paket_tryout')->onDelete('cascade');
            $table->decimal('nilai', 6, 2)->default(0);
            $table->integer('jumlah_benar')->default(0);
            $table->integer('jumlah_salah')->default(0);
            $table->integer('jumlah_kosong')->default(0);
            $table->integer('durasi_pengerjaan')->default(0); // detik
            $table->boolean('lulus')->default(false);
            $table->timestamps();

            $table->index(['paket_id', 'nilai']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hasil_tryout');
        Schema::dropIfExists('jawaban_ujian');
        Schema::dropIfExists('sesi_ujian');
        Schema::dropIfExists('paket_soal');
        Schema::dropIfExists('soal');
        Schema::dropIfExists('paket_tryout');
        Schema::dropIfExists('kategori');
    }
};
