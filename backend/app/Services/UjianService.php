<?php

namespace App\Services;

use App\Models\HasilTryout;
use App\Models\JawabanUjian;
use App\Models\PaketTryout;
use App\Models\SesiUjian;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UjianService
{
    public function mulaiUjian(int $userId, int $paketId): array
    {
        $paket = PaketTryout::with('soal')->findOrFail($paketId);

        // Check access control
        if ($paket->access_mode === 'terbatas') {
            $hasAccess = DB::table('user_paket_access')
                ->where('user_id', $userId)
                ->where('paket_id', $paketId)
                ->exists();
            if (!$hasAccess) {
                abort(403, 'Anda tidak memiliki akses ke paket tryout ini.');
            }
        }

        // Check if user already has ongoing session for this paket
        $existing = SesiUjian::where('user_id', $userId)
            ->where('paket_id', $paketId)
            ->where('status', 'berlangsung')
            ->with(['jawaban', 'paket'])
            ->first();

        if ($existing) {
            // Recalculate remaining time
            $elapsed      = (int) Carbon::now()->diffInSeconds($existing->mulai_at);
            $totalDetik   = $paket->durasi * 60;
            $waktuTersisa = max(0, $totalDetik - $elapsed);

            if ($waktuTersisa <= 0) {
                $this->submitUjian($existing->id);
                $existing->refresh();
            } else {
                $existing->update(['waktu_tersisa' => (int) $waktuTersisa]);
            }

            // Shuffle soal with consistent seed for this session
            $soal = $paket->soal->shuffle($existing->id);

            return [
                'sesi' => $existing->load('jawaban', 'paket'),
                'soal' => $soal->values(),
            ];
        }

        $sesi = SesiUjian::create([
            'user_id'      => $userId,
            'paket_id'     => $paketId,
            'status'       => 'berlangsung',
            'mulai_at'     => now(),
            'waktu_tersisa'=> $paket->durasi * 60,
        ]);

        // Shuffle soal with consistent seed for this session
        $soal = $paket->soal->shuffle($sesi->id);

        return [
            'sesi' => $sesi->load('paket'),
            'soal' => $soal->values(),
        ];
    }

    public function getSesi(int $sesiId): array
    {
        $sesi  = SesiUjian::with(['jawaban', 'paket'])->findOrFail($sesiId);
        $paket = PaketTryout::with('soal')->findOrFail($sesi->paket_id);

        // Sync remaining time
        if ($sesi->status === 'berlangsung') {
            $elapsed      = (int) Carbon::now()->diffInSeconds($sesi->mulai_at);
            $totalDetik   = $paket->durasi * 60;
            $waktuTersisa = max(0, $totalDetik - $elapsed);
            $sesi->update(['waktu_tersisa' => (int) $waktuTersisa]);
        }

        // Shuffle soal with consistent seed for this session
        $soal = $paket->soal->shuffle($sesi->id);

        return [
            'sesi' => $sesi,
            'soal' => $soal->values(),
        ];
    }

    public function simpanJawaban(int $sesiId, int $soalId, string $jawaban): JawabanUjian
    {
        return JawabanUjian::updateOrCreate(
            ['sesi_id' => $sesiId, 'soal_id' => $soalId],
            ['jawaban' => $jawaban]
        );
    }

    public function submitUjian(int $sesiId): HasilTryout
    {
        return DB::transaction(function () use ($sesiId) {
            $sesi = SesiUjian::with(['jawaban', 'paket.soal'])->findOrFail($sesiId);

            if ($sesi->status === 'selesai') {
                return HasilTryout::where('sesi_id', $sesiId)->firstOrFail();
            }

            $paket        = $sesi->paket;
            $soalList     = $paket->soal;
            $jawabanMap   = $sesi->jawaban->keyBy('soal_id');

            $jumlahBenar  = 0;
            $jumlahSalah  = 0;
            $jumlahKosong = 0;
            $totalBobot   = 0;
            $bobotBenar   = 0;

            foreach ($soalList as $soal) {
                $totalBobot += $soal->bobot;
                $j = $jawabanMap->get($soal->id);

                if (!$j || !$j->jawaban) {
                    $jumlahKosong++;
                    // Update jawaban is_benar = false
                    if ($j) $j->update(['is_benar' => false]);
                } elseif ($j->jawaban === $soal->kunci_jawaban) {
                    $jumlahBenar++;
                    $bobotBenar += $soal->bobot;
                    $j->update(['is_benar' => true]);
                } else {
                    $jumlahSalah++;
                    $j->update(['is_benar' => false]);
                }
            }

            // Calculate score (0-100 scale)
            $nilai = $totalBobot > 0 ? round(($bobotBenar / $totalBobot) * 100, 2) : 0;

            $durasiPengerjaan = (int) Carbon::parse($sesi->mulai_at)->diffInSeconds(now());

            $sesi->update([
                'status'     => 'selesai',
                'selesai_at' => now(),
            ]);

            return HasilTryout::create([
                'sesi_id'           => $sesiId,
                'user_id'           => $sesi->user_id,
                'paket_id'          => $paket->id,
                'nilai'             => $nilai,
                'jumlah_benar'      => $jumlahBenar,
                'jumlah_salah'      => $jumlahSalah,
                'jumlah_kosong'     => $jumlahKosong,
                'durasi_pengerjaan' => $durasiPengerjaan,
                'lulus'             => $nilai >= $paket->passing_grade,
            ]);
        });
    }
}
