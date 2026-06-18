<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soal;
use App\Models\SoalCommission;
use Illuminate\Http\Request;

class PembuatSoalController extends Controller
{
    use \App\Traits\HandlesSoalImages;
    /** List soal created by this pembuat soal */
    public function mySoal(Request $request)
    {
        $query = Soal::with('kategori')
            ->where('created_by', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('verification_status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('pertanyaan', 'like', "%{$request->search}%");
        }

        $soal = $query->latest()->get();

        // Stats
        $stats = [
            'total'    => Soal::where('created_by', $request->user()->id)->count(),
            'draft'    => Soal::where('created_by', $request->user()->id)->where('verification_status', 'draft')->count(),
            'verified' => Soal::where('created_by', $request->user()->id)->where('verification_status', 'verified')->count(),
            'rejected' => Soal::where('created_by', $request->user()->id)->where('verification_status', 'rejected')->count(),
        ];

        return response()->json(['data' => $soal, 'stats' => $stats]);
    }

    /** Create a new soal (status = draft, needs verifikator approval) */
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

        $data['created_by'] = $request->user()->id;
        $data['verification_status'] = 'draft';

        $images = $this->uploadSoalImages($request);
        $soal = Soal::create(array_merge($data, $images));

        return response()->json(['message' => 'Soal berhasil diajukan, menunggu verifikasi.', 'data' => $soal], 201);
    }

    /** Update own soal (only if still draft or rejected) */
    public function update(Request $request, int $id)
    {
        $soal = Soal::where('created_by', $request->user()->id)->findOrFail($id);

        if ($soal->verification_status === 'verified') {
            return response()->json(['message' => 'Soal yang sudah terverifikasi tidak bisa diedit.'], 422);
        }

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

        // Reset back to draft if was rejected
        $data['verification_status'] = 'draft';
        $data['rejection_note'] = null;
        $data['verified_by'] = null;
        $data['verified_at'] = null;

        $images = $this->uploadSoalImages($request, $soal->toArray());
        $soal->update(array_merge($data, $images));

        return response()->json(['message' => 'Soal diperbarui dan diajukan ulang.', 'data' => $soal]);
    }

    /** Delete own soal (only if not verified) */
    public function destroy(Request $request, int $id)
    {
        $soal = Soal::where('created_by', $request->user()->id)->findOrFail($id);

        if ($soal->verification_status === 'verified') {
            return response()->json(['message' => 'Soal yang sudah terverifikasi tidak bisa dihapus.'], 422);
        }

        $soal->delete();

        return response()->json(['message' => 'Soal berhasil dihapus.']);
    }

    /** Dashboard komisi pembuat soal */
    public function commissionDashboard(Request $request)
    {
        $user = $request->user();

        $totalEarned = $user->soalCommissions()->sum('commission_amount');
        $pendingEarned = $user->soalCommissions()->where('status', 'pending')->sum('commission_amount');
        $paidEarned = $user->soalCommissions()->where('status', 'paid')->sum('commission_amount');

        $totalVerifiedSoal = $user->createdSoal()->where('verification_status', 'verified')->count();

        $recentCommissions = $user->soalCommissions()
            ->with(['paket:id,judul', 'payment:id,order_id,amount'])
            ->latest()
            ->take(20)
            ->get();

        return response()->json(['data' => [
            'soal_commission_pct' => $user->soal_commission_pct,
            'total_verified_soal' => $totalVerifiedSoal,
            'total_earned'        => (int) $totalEarned,
            'pending_earned'      => (int) $pendingEarned,
            'paid_earned'         => (int) $paidEarned,
            'commissions'         => $recentCommissions,
        ]]);
    }
}
