<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soal;
use Illuminate\Http\Request;

class SoalController extends Controller
{
    use \App\Traits\HandlesSoalImages;
    public function index(Request $request)
    {
        $query = Soal::with(['kategori', 'creator:id,name,email', 'verifier:id,name,email']);
        if ($request->filled('kategori_id')) $query->where('kategori_id', $request->kategori_id);
        if ($request->filled('search'))      $query->where('pertanyaan', 'like', "%{$request->search}%");
        if ($request->filled('paket_id')) {
            $query->whereHas('paket', fn($q) => $q->where('paket_tryout.id', $request->paket_id));
        }
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->verification_status);
        }
        return response()->json(['data' => $query->latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(array_merge([
            'kategori_id'    => 'required|exists:kategori,id',
            'pertanyaan'     => 'required|string',
            'pilihan_a'      => 'required|string',
            'pilihan_b'      => 'required|string',
            'pilihan_c'      => 'required|string',
            'pilihan_d'      => 'required|string',
            'pilihan_e'      => 'nullable|string',
            'kunci_jawaban'  => 'required|in:A,B,C,D,E',
            'pembahasan'     => 'nullable|string',
            'bobot'          => 'integer|min:1',
        ], $this->imageValidationRules()));

        $images = $this->uploadSoalImages($request);
        $soal = Soal::create(array_merge($data, $images));
        return response()->json(['message' => 'Soal dibuat', 'data' => $soal], 201);
    }

    public function show(string $id)
    {
        return response()->json(['data' => Soal::with('kategori')->findOrFail($id)]);
    }

    public function update(Request $request, string $id)
    {
        $soal = Soal::findOrFail($id);
        $data = $request->validate(array_merge([
            'kategori_id'   => 'sometimes|exists:kategori,id',
            'pertanyaan'    => 'sometimes|string',
            'pilihan_a'     => 'sometimes|string',
            'pilihan_b'     => 'sometimes|string',
            'pilihan_c'     => 'sometimes|string',
            'pilihan_d'     => 'sometimes|string',
            'pilihan_e'     => 'nullable|string',
            'kunci_jawaban' => 'sometimes|in:A,B,C,D,E',
            'pembahasan'    => 'nullable|string',
            'bobot'         => 'integer|min:1',
        ], $this->imageValidationRules()));

        $images = $this->uploadSoalImages($request, $soal->toArray());
        $soal->update(array_merge($data, $images));
        return response()->json(['message' => 'Soal diperbarui', 'data' => $soal]);
    }

    public function destroy(string $id)
    {
        Soal::findOrFail($id)->delete();
        return response()->json(['message' => 'Soal dihapus']);
    }

    /** Import soal dari file Excel */
    public function import(Request $request)
    {
        $request->validate([
            'file'        => 'required|file|mimes:xlsx,xls,csv|max:5120',
            'paket_id'    => 'required|exists:paket_tryout,id',
        ]);

        $paket = \App\Models\PaketTryout::findOrFail($request->paket_id);

        try {
            $import = new \App\Imports\SoalImport((int) $paket->kategori_id);
            \Maatwebsite\Excel\Facades\Excel::import($import, $request->file('file'));

            // Auto-attach imported soal to paket
            $soalIds = $import->getImportedIds();
            $existingIds = \DB::table('paket_soal')
                ->where('paket_id', $paket->id)
                ->pluck('soal_id')
                ->toArray();

            $newIds = array_diff($soalIds, $existingIds);
            if (!empty($newIds)) {
                $rows = array_map(fn($sid) => [
                    'paket_id'   => $paket->id,
                    'soal_id'    => $sid,
                ], $newIds);
                \DB::table('paket_soal')->insert($rows);
            }

            // Update jumlah_soal
            $totalSoal = \DB::table('paket_soal')->where('paket_id', $paket->id)->count();
            $paket->update(['jumlah_soal' => $totalSoal]);

            return response()->json([
                'message' => "Berhasil mengimport {$import->getImportedCount()} soal ke paket \"{$paket->judul}\"",
                'count'   => $import->getImportedCount(),
                'total_soal_paket' => $totalSoal,
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = collect($e->failures())->map(fn($f) => [
                'row'     => $f->row(),
                'field'   => $f->attribute(),
                'errors'  => $f->errors(),
            ]);
            return response()->json([
                'message'  => 'Validasi gagal pada beberapa baris',
                'failures' => $failures,
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal import: ' . $e->getMessage(),
            ], 500);
        }
    }

    /** Download template Excel */
    public function downloadTemplate()
    {
        $headers = ['pertanyaan', 'pilihan_a', 'pilihan_b', 'pilihan_c', 'pilihan_d', 'pilihan_e', 'kunci_jawaban', 'pembahasan', 'bobot'];
        $example = [
            'Apa kepanjangan dari UUD 1945?',
            'Undang-Undang Dasar',
            'Undang-Undang Daerah',
            'Undang-Undang Desa',
            'Undang-Undang Darurat',
            '',
            'A',
            'UUD 1945 adalah Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
            '1',
        ];

        $callback = function () use ($headers, $example) {
            $file = fopen('php://output', 'w');
            // BOM for UTF-8
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, $headers);
            fputcsv($file, $example);
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=template_soal.csv',
        ]);
    }
}
