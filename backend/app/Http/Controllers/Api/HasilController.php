<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilTryout;
use Illuminate\Http\Request;

class HasilController extends Controller
{
    public function index(Request $request)
    {
        $hasil = HasilTryout::with('paket.kategori')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $hasil->items(),
            'meta' => [
                'current_page' => $hasil->currentPage(),
                'last_page'    => $hasil->lastPage(),
                'per_page'     => $hasil->perPage(),
                'total'        => $hasil->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id)
    {
        $hasil = HasilTryout::with('paket.kategori', 'user')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $rank = HasilTryout::where('paket_id', $hasil->paket_id)
            ->where('nilai', '>', $hasil->nilai)
            ->count() + 1;

        return response()->json(['data' => array_merge($hasil->toArray(), ['rank' => $rank])]);
    }

    /** Get pembahasan: soal + jawaban user + kunci jawaban */
    public function pembahasan(Request $request, string $id)
    {
        $hasil = HasilTryout::with('paket')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $sesi = \App\Models\SesiUjian::with('jawaban')
            ->where('id', $hasil->sesi_id)
            ->first();

        $paket = \App\Models\PaketTryout::with('soal')->findOrFail($hasil->paket_id);

        $jawabanMap = $sesi ? $sesi->jawaban->keyBy('soal_id') : collect();

        $pembahasan = $paket->soal->map(function ($soal, $index) use ($jawabanMap) {
            $jawaban = $jawabanMap->get($soal->id);
            return [
                'nomor'          => $index + 1,
                'soal_id'        => $soal->id,
                'pertanyaan'     => $soal->pertanyaan,
                'pilihan_a'      => $soal->pilihan_a,
                'pilihan_b'      => $soal->pilihan_b,
                'pilihan_c'      => $soal->pilihan_c,
                'pilihan_d'      => $soal->pilihan_d,
                'pilihan_e'      => $soal->pilihan_e,
                'kunci_jawaban'  => $soal->kunci_jawaban,
                'jawaban_user'   => $jawaban?->jawaban,
                'is_benar'       => $jawaban?->is_benar ?? false,
                'pembahasan'     => $soal->pembahasan,
            ];
        });

        return response()->json([
            'data' => [
                'hasil'      => $hasil,
                'pembahasan' => $pembahasan,
            ],
        ]);
    }
}
