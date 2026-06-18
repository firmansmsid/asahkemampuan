<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaketTryout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaketTryoutController extends Controller
{
    public function index(Request $request)
    {
        $query = PaketTryout::with('kategori');

        if ($request->filled('status'))      $query->where('status', $request->status);
        if ($request->filled('kategori_id')) $query->where('kategori_id', $request->kategori_id);
        if ($request->filled('search'))      $query->where('judul', 'like', "%{$request->search}%");

        $paket = $query->latest()->paginate($request->get('per_page', 100));

        // For non-admin users, add has_access flag
        $user = $request->user();
        $accessiblePaketIds = [];

        if ($user && $user->role !== 'admin') {
            $accessiblePaketIds = \DB::table('user_paket_access')
                ->where('user_id', $user->id)
                ->pluck('paket_id')
                ->toArray();
        }

        $items = collect($paket->items())->map(function ($p) use ($user, $accessiblePaketIds) {
            $p->append('peserta_count');

            if ($user && $user->role !== 'admin') {
                $p->has_access = $p->access_mode === 'publik' || in_array($p->id, $accessiblePaketIds);
            } else {
                $p->has_access = true;
            }

            return $p;
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paket->currentPage(),
                'last_page'    => $paket->lastPage(),
                'per_page'     => $paket->perPage(),
                'total'        => $paket->total(),
            ],
        ]);
    }

    /** Public list for register page (no auth) */
    public function publicList(Request $request)
    {
        $query = PaketTryout::with('kategori')->where('status', 'aktif');
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }
        $paket = $query->latest()->get(['id', 'kategori_id', 'judul', 'is_gratis', 'harga', 'slug']);

        return response()->json(['data' => $paket]);
    }

    public function show(Request $request, string $id)
    {
        $paket = PaketTryout::with('kategori')->findOrFail($id);
        $paket->append('peserta_count');

        $user = $request->user();
        if ($user && $user->role !== 'admin') {
            $hasAccess = $paket->access_mode === 'publik'
                || \DB::table('user_paket_access')
                    ->where('user_id', $user->id)
                    ->where('paket_id', $paket->id)
                    ->exists();
            $paket->has_access = $hasAccess;
        } else {
            $paket->has_access = true;
        }

        return response()->json(['data' => $paket]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kategori_id'   => 'required|exists:kategori,id',
            'judul'         => 'required|string|max:255',
            'deskripsi'     => 'nullable|string',
            'durasi'        => 'required|integer|min:5',
            'jumlah_soal'   => 'required|integer|min:1',
            'passing_grade' => 'required|integer|min:0|max:100',
            'is_gratis'     => 'boolean',
            'harga'         => 'nullable|numeric|min:0',
            'access_mode'   => 'in:publik,terbatas',
            'status'        => 'in:aktif,nonaktif',
        ]);
        $data['harga'] = $data['is_gratis'] ?? false ? 0 : ($data['harga'] ?? 0);
        $data['slug'] = Str::slug($data['judul']) . '-' . Str::random(4);
        $paket = PaketTryout::create($data);

        // Auto-attach soal from same kategori
        $soalIds = \App\Models\Soal::where('kategori_id', $data['kategori_id'])->pluck('id');
        if ($soalIds->isNotEmpty()) {
            $soalWithOrder = $soalIds->mapWithKeys(fn($id, $i) => [$id => ['urutan' => $i + 1]]);
            $paket->soal()->sync($soalWithOrder);
            $paket->update(['jumlah_soal' => $soalIds->count()]);
        }

        return response()->json([
            'message' => "Paket dibuat dengan {$soalIds->count()} soal",
            'data' => $paket->load('soal'),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $paket = PaketTryout::findOrFail($id);
        $data  = $request->validate([
            'kategori_id'   => 'sometimes|exists:kategori,id',
            'judul'         => 'sometimes|string|max:255',
            'deskripsi'     => 'nullable|string',
            'durasi'        => 'sometimes|integer|min:5',
            'jumlah_soal'   => 'sometimes|integer|min:1',
            'passing_grade' => 'sometimes|integer|min:0|max:100',
            'is_gratis'     => 'boolean',
            'harga'         => 'nullable|numeric|min:0',
            'access_mode'   => 'in:publik,terbatas',
            'status'        => 'in:aktif,nonaktif',
        ]);
        if (isset($data['is_gratis']) && $data['is_gratis']) {
            $data['harga'] = 0;
        }
        if (isset($data['judul'])) $data['slug'] = Str::slug($data['judul']);
        $paket->update($data);
        return response()->json(['message' => 'Paket diperbarui', 'data' => $paket]);
    }

    public function destroy(int $id)
    {
        PaketTryout::findOrFail($id)->delete();
        return response()->json(['message' => 'Paket dihapus']);
    }

    public function attachSoal(Request $request, int $id)
    {
        $data  = $request->validate(['soal_ids' => 'required|array', 'soal_ids.*' => 'exists:soal,id']);
        $paket = PaketTryout::findOrFail($id);
        $soalWithOrder = collect($data['soal_ids'])->mapWithKeys(fn($sid, $i) => [$sid => ['urutan' => $i + 1]]);
        $paket->soal()->syncWithoutDetaching($soalWithOrder);
        return response()->json(['message' => 'Soal ditambahkan ke paket']);
    }

    public function detachSoal(int $id, int $soalId)
    {
        PaketTryout::findOrFail($id)->soal()->detach($soalId);
        return response()->json(['message' => 'Soal dihapus dari paket']);
    }

    // ===== Access Control =====

    public function setAccessMode(Request $request, int $id)
    {
        $data = $request->validate(['access_mode' => 'required|in:publik,terbatas']);
        $paket = PaketTryout::findOrFail($id);
        $paket->update(['access_mode' => $data['access_mode']]);
        return response()->json(['message' => "Mode akses diubah ke {$data['access_mode']}", 'data' => $paket]);
    }

    public function getAllowedUsers(int $id)
    {
        $paket = PaketTryout::with('allowedUsers:id,name,email')->findOrFail($id);
        return response()->json([
            'access_mode' => $paket->access_mode,
            'users' => $paket->allowedUsers,
        ]);
    }

    public function assignUsers(Request $request, int $id)
    {
        $data = $request->validate(['user_ids' => 'required|array', 'user_ids.*' => 'exists:users,id']);
        $paket = PaketTryout::findOrFail($id);
        $paket->allowedUsers()->syncWithoutDetaching($data['user_ids']);
        return response()->json(['message' => count($data['user_ids']) . ' user diberikan akses']);
    }

    public function revokeUser(int $id, int $userId)
    {
        PaketTryout::findOrFail($id)->allowedUsers()->detach($userId);
        return response()->json(['message' => 'Akses user dicabut']);
    }
}
