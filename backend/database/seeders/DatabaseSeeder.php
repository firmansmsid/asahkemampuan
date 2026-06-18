<?php

namespace Database\Seeders;

use App\Models\HasilTryout;
use App\Models\JawabanUjian;
use App\Models\Kategori;
use App\Models\PaketTryout;
use App\Models\SesiUjian;
use App\Models\Soal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET session_replication_role = replica;');

        // ====================== USERS ======================
        $admin = User::create([
            'name'     => 'Administrator',
            'email'    => 'admin@tryoutpro.com',
            'password' => bcrypt('password'),
            'role'     => 'admin',
        ]);

        $peserta1 = User::create([
            'name'     => 'Budi Santoso',
            'email'    => 'peserta@demo.com',
            'password' => bcrypt('password'),
            'role'     => 'peserta',
        ]);

        $otherUsers = collect([
            ['Ani Rahayu', 'ani@demo.com'],
            ['Devi Kusuma', 'devi@demo.com'],
            ['Rizky Pratama', 'rizky@demo.com'],
            ['Siti Nurhaliza', 'siti@demo.com'],
        ])->map(fn($u) => User::create([
            'name'     => $u[0],
            'email'    => $u[1],
            'password' => bcrypt('password'),
            'role'     => 'peserta',
        ]));

        // ====================== KATEGORI ======================
        $kategoriData = [
            ['nama' => 'CPNS / SKD', 'slug' => 'cpns', 'deskripsi' => 'Tes Seleksi Kompetensi Dasar untuk CPNS', 'icon' => '🏛️'],
            ['nama' => 'UTBK / SNBT', 'slug' => 'utbk', 'deskripsi' => 'Ujian Tulis Berbasis Komputer untuk masuk PTN', 'icon' => '📚'],
            ['nama' => 'TOEFL / IELTS', 'slug' => 'toefl', 'deskripsi' => 'Tes kemampuan Bahasa Inggris internasional', 'icon' => '🌐'],
            ['nama' => 'Matematika', 'slug' => 'matematika', 'deskripsi' => 'Soal matematika dari dasar hingga lanjut', 'icon' => '🔢'],
            ['nama' => 'P3K / PPPK', 'slug' => 'p3k', 'deskripsi' => 'Seleksi Pegawai Pemerintah dengan Perjanjian Kerja', 'icon' => '⚕️'],
        ];

        $kategoriList = collect($kategoriData)->map(fn($k) => Kategori::create($k));

        // ====================== SOAL ======================
        $soalBank = [];
        $jawabans = ['A', 'B', 'C', 'D'];

        foreach ($kategoriList as $kat) {
            for ($i = 1; $i <= 30; $i++) {
                $kunci = $jawabans[array_rand($jawabans)];
                $soalBank[] = Soal::create([
                    'kategori_id'   => $kat->id,
                    'pertanyaan'    => "Soal nomor {$i} untuk kategori {$kat->nama}. Pertanyaan ini menguji pemahaman tentang materi {$kat->nama} level " . ($i <= 10 ? 'dasar' : ($i <= 20 ? 'menengah' : 'lanjut')) . ".",
                    'pilihan_a'     => "Jawaban A untuk soal {$i}",
                    'pilihan_b'     => "Jawaban B untuk soal {$i}",
                    'pilihan_c'     => "Jawaban C untuk soal {$i}",
                    'pilihan_d'     => "Jawaban D untuk soal {$i}",
                    'kunci_jawaban' => $kunci,
                    'pembahasan'    => "Pembahasan soal {$i}: Jawaban yang benar adalah {$kunci} karena sesuai dengan konsep {$kat->nama}.",
                    'bobot'         => 1,
                ]);
            }
        }

        // ====================== PAKET TRYOUT ======================
        $paketData = [
            ['kat' => 0, 'judul' => 'SKD CPNS Paket A - Simulasi Lengkap', 'durasi' => 100, 'soal' => 20, 'grade' => 65, 'gratis' => true],
            ['kat' => 0, 'judul' => 'SKD CPNS Paket B - Tingkat Lanjut', 'durasi' => 100, 'soal' => 20, 'grade' => 70, 'gratis' => true],
            ['kat' => 1, 'judul' => 'UTBK Saintek 2024 - Paket 1', 'durasi' => 115, 'soal' => 20, 'grade' => 60, 'gratis' => false],
            ['kat' => 1, 'judul' => 'UTBK Soshum 2024 - Paket 1', 'durasi' => 115, 'soal' => 20, 'grade' => 60, 'gratis' => true],
            ['kat' => 2, 'judul' => 'TOEFL Preparation - Basic', 'durasi' => 90, 'soal' => 20, 'grade' => 60, 'gratis' => true],
            ['kat' => 3, 'judul' => 'Matematika Dasar - SMA', 'durasi' => 60, 'soal' => 20, 'grade' => 70, 'gratis' => true],
            ['kat' => 4, 'judul' => 'P3K Kompetensi Teknis - Paket A', 'durasi' => 100, 'soal' => 20, 'grade' => 65, 'gratis' => false],
        ];

        $paketList = [];
        foreach ($paketData as $pd) {
            $kat    = $kategoriList[$pd['kat']];
            $paket  = PaketTryout::create([
                'kategori_id'   => $kat->id,
                'judul'         => $pd['judul'],
                'slug'          => Str::slug($pd['judul']),
                'deskripsi'     => "Paket tryout {$pd['judul']} untuk mempersiapkan ujian secara komprehensif. Berisi {$pd['soal']} soal pilihan.",
                'durasi'        => $pd['durasi'],
                'jumlah_soal'   => $pd['soal'],
                'passing_grade' => $pd['grade'],
                'is_gratis'     => $pd['gratis'],
                'status'        => 'aktif',
            ]);

            // Attach soal dari kategori yang sama
            $soalKat = collect($soalBank)->filter(fn($s) => $s->kategori_id === $kat->id)->take($pd['soal']);
            $soalKat->values()->each(function ($soal, $idx) use ($paket) {
                DB::table('paket_soal')->insert([
                    'paket_id' => $paket->id,
                    'soal_id'  => $soal->id,
                    'urutan'   => $idx + 1,
                ]);
            });

            $paketList[] = $paket;
        }

        // ====================== SESI & HASIL DUMMY ======================
        $allUsers = collect([$peserta1])->merge($otherUsers);

        foreach ($allUsers as $user) {
            foreach (array_slice($paketList, 0, 3) as $paket) {
                $mulai = Carbon::now()->subDays(rand(1, 30))->subMinutes(rand(0, 59));
                $durasi = rand(3000, $paket->durasi * 60);

                $sesi = SesiUjian::create([
                    'user_id'       => $user->id,
                    'paket_id'      => $paket->id,
                    'status'        => 'selesai',
                    'mulai_at'      => $mulai,
                    'selesai_at'    => $mulai->copy()->addSeconds($durasi),
                    'waktu_tersisa' => 0,
                ]);

                // Attach random jawaban
                $soalPaket = DB::table('paket_soal')->where('paket_id', $paket->id)->get();
                $benar = 0; $salah = 0; $kosong = 0;

                foreach ($soalPaket as $ps) {
                    $soal   = collect($soalBank)->firstWhere('id', $ps->soal_id);
                    $pilihan = ['A', 'B', 'C', 'D', null];
                    $jawaban = $pilihan[array_rand($pilihan)];

                    JawabanUjian::create([
                        'sesi_id'  => $sesi->id,
                        'soal_id'  => $ps->soal_id,
                        'jawaban'  => $jawaban,
                        'is_benar' => $jawaban && $soal ? ($jawaban === $soal->kunci_jawaban) : false,
                    ]);

                    if (!$jawaban) $kosong++;
                    elseif ($soal && $jawaban === $soal->kunci_jawaban) $benar++;
                    else $salah++;
                }

                $total = $benar + $salah + $kosong;
                $nilai = $total > 0 ? round(($benar / $total) * 100, 2) : 0;

                HasilTryout::create([
                    'sesi_id'           => $sesi->id,
                    'user_id'           => $user->id,
                    'paket_id'          => $paket->id,
                    'nilai'             => $nilai,
                    'jumlah_benar'      => $benar,
                    'jumlah_salah'      => $salah,
                    'jumlah_kosong'     => $kosong,
                    'durasi_pengerjaan' => $durasi,
                    'lulus'             => $nilai >= $paket->passing_grade,
                    'created_at'        => $mulai->copy()->addSeconds($durasi),
                ]);
            }
        }

        DB::statement('SET session_replication_role = DEFAULT;');

        $this->command->info('✅ Seeder selesai! Data dummy berhasil dibuat.');
        $this->command->info('📧 Admin: admin@tryoutpro.com | password');
        $this->command->info('📧 Peserta: peserta@demo.com | password');
    }
}
