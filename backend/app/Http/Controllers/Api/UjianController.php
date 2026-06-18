<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UjianService;
use Illuminate\Http\Request;

class UjianController extends Controller
{
    public function __construct(private UjianService $ujianService) {}

    public function mulai(Request $request)
    {
        $request->validate(['paket_id' => 'required|exists:paket_tryout,id']);
        $result = $this->ujianService->mulaiUjian($request->user()->id, $request->paket_id);
        return response()->json(['message' => 'Ujian dimulai', 'data' => $result]);
    }

    public function getSesi(Request $request, int $id)
    {
        $result = $this->ujianService->getSesi($id);
        return response()->json(['data' => $result]);
    }

    public function simpanJawaban(Request $request, int $id)
    {
        $data = $request->validate([
            'soal_id' => 'required|exists:soal,id',
            'jawaban' => 'required|in:A,B,C,D,E',
        ]);
        $jawaban = $this->ujianService->simpanJawaban($id, $data['soal_id'], $data['jawaban']);
        return response()->json(['message' => 'Jawaban disimpan', 'data' => $jawaban]);
    }

    public function syncTimer(Request $request, int $id)
    {
        $request->validate(['waktu_tersisa' => 'required|numeric|min:0']);
        $sesi = \App\Models\SesiUjian::findOrFail($id);
        $sesi->update(['waktu_tersisa' => (int) $request->waktu_tersisa]);
        return response()->json(['message' => 'Timer disinkronkan']);
    }

    public function submit(Request $request, int $id)
    {
        $hasil = $this->ujianService->submitUjian($id);
        return response()->json(['message' => 'Ujian selesai', 'data' => $hasil->load('paket')]);
    }
}
