<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccessRequestController extends Controller
{
    /** User submits a request for paket access */
    public function store(Request $request)
    {
        $data = $request->validate([
            'paket_id' => 'required|exists:paket_tryout,id',
            'pesan'    => 'nullable|string|max:500',
        ]);

        // Check if already has pending request
        $existing = AccessRequest::where('user_id', $request->user()->id)
            ->where('paket_id', $data['paket_id'])
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Kamu sudah mengajukan permintaan untuk paket ini. Tunggu persetujuan admin.',
            ], 422);
        }

        // Check if already has access
        $hasAccess = DB::table('user_paket_access')
            ->where('user_id', $request->user()->id)
            ->where('paket_id', $data['paket_id'])
            ->exists();

        if ($hasAccess) {
            return response()->json(['message' => 'Kamu sudah memiliki akses ke paket ini.'], 422);
        }

        $ar = AccessRequest::create([
            'user_id'  => $request->user()->id,
            'paket_id' => $data['paket_id'],
            'pesan'    => $data['pesan'] ?? null,
            'status'   => 'pending',
        ]);

        return response()->json([
            'message' => 'Permintaan akses berhasil dikirim. Admin akan meninjau permintaanmu.',
            'data' => $ar->load('paket'),
        ], 201);
    }

    /** User checks their own requests */
    public function myRequests(Request $request)
    {
        $requests = AccessRequest::with('paket.kategori')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $requests]);
    }

    /** Admin: list all pending requests */
    public function index(Request $request)
    {
        $query = AccessRequest::with(['user', 'paket.kategori', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        $requests = $query->latest()->paginate(20);

        return response()->json([
            'data' => $requests->items(),
            'meta' => [
                'total' => $requests->total(),
                'pending_count' => AccessRequest::where('status', 'pending')->count(),
            ],
        ]);
    }

    /** Admin approves a request */
    public function approve(Request $request, int $id)
    {
        $ar = AccessRequest::with(['paket', 'user'])->findOrFail($id);

        if ($ar->status !== 'pending') {
            return response()->json(['message' => 'Permintaan sudah diproses.'], 422);
        }

        $ar->update([
            'status'      => 'approved',
            'admin_note'  => $request->input('admin_note'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Grant access
        DB::table('user_paket_access')->insertOrIgnore([
            'user_id'    => $ar->user_id,
            'paket_id'   => $ar->paket_id,
            'granted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send email notification to user
        try {
            \Illuminate\Support\Facades\Mail::to($ar->user->email)
                ->send(new \App\Mail\AccessApprovedNotification($ar->user, $ar->paket));
        } catch (\Exception $e) {
            \Log::error('Access approved email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Permintaan disetujui. User sekarang bisa mengakses paket.',
            'data' => $ar->load(['user', 'paket']),
        ]);
    }

    /** Admin rejects a request */
    public function reject(Request $request, int $id)
    {
        $ar = AccessRequest::findOrFail($id);

        if ($ar->status !== 'pending') {
            return response()->json(['message' => 'Permintaan sudah diproses.'], 422);
        }

        $ar->update([
            'status'      => 'rejected',
            'admin_note'  => $request->input('admin_note', 'Ditolak oleh admin'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Permintaan ditolak.',
            'data' => $ar,
        ]);
    }
}
