<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Soal;
use Illuminate\Http\Request;

class VerifikatorController extends Controller
{
    /** List soal pending verification */
    public function pendingSoal(Request $request)
    {
        $query = Soal::with(['kategori', 'creator:id,name,email']);

        if ($request->filled('status') && in_array($request->status, ['draft', 'verified', 'rejected'])) {
            $query->where('verification_status', $request->status);
        } else {
            $query->where('verification_status', 'draft');
        }

        if ($request->filled('search')) {
            $query->where('pertanyaan', 'like', "%{$request->search}%");
        }

        $soal = $query->latest()->get();

        // Stats
        $stats = [
            'pending'  => Soal::where('verification_status', 'draft')->count(),
            'verified' => Soal::where('verification_status', 'verified')->count(),
            'rejected' => Soal::where('verification_status', 'rejected')->count(),
        ];

        return response()->json(['data' => $soal, 'stats' => $stats]);
    }

    /** View single soal for review */
    public function show(int $id)
    {
        $soal = Soal::with(['kategori', 'creator:id,name,email', 'verifier:id,name,email'])->findOrFail($id);
        return response()->json(['data' => $soal]);
    }

    /** Approve soal */
    public function approve(Request $request, int $id)
    {
        $soal = Soal::findOrFail($id);

        if ($soal->verification_status === 'verified') {
            return response()->json(['message' => 'Soal sudah terverifikasi.'], 422);
        }

        $soal->update([
            'verification_status' => 'verified',
            'verified_by'         => $request->user()->id,
            'verified_at'         => now(),
            'rejection_note'      => null,
        ]);

        return response()->json(['message' => 'Soal berhasil diverifikasi.', 'data' => $soal]);
    }

    /** Reject soal with note */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_note' => 'required|string|max:1000',
        ]);

        $soal = Soal::findOrFail($id);

        if ($soal->verification_status === 'verified') {
            return response()->json(['message' => 'Soal yang sudah terverifikasi tidak bisa ditolak. Hubungi admin.'], 422);
        }

        $soal->update([
            'verification_status' => 'rejected',
            'verified_by'         => $request->user()->id,
            'verified_at'         => now(),
            'rejection_note'      => $request->rejection_note,
        ]);

        return response()->json(['message' => 'Soal ditolak.', 'data' => $soal]);
    }
}
