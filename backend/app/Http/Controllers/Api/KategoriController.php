<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KategoriController extends Controller
{
    public function index(Request $request)
    {
        $kategori = Kategori::withCount('paket')->orderBy('nama')->get();
        return response()->json(['data' => $kategori]);
    }

    public function show(int $id)
    {
        $kategori = Kategori::withCount('paket')->findOrFail($id);
        return response()->json(['data' => $kategori]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama'      => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'icon'      => 'nullable|string',
        ]);
        $data['slug'] = Str::slug($data['nama']);
        $kategori = Kategori::create($data);
        return response()->json(['message' => 'Kategori dibuat', 'data' => $kategori], 201);
    }

    public function update(Request $request, int $id)
    {
        $kategori = Kategori::findOrFail($id);
        $data = $request->validate([
            'nama'      => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'icon'      => 'nullable|string',
        ]);
        $data['slug'] = Str::slug($data['nama']);
        $kategori->update($data);
        return response()->json(['message' => 'Kategori diperbarui', 'data' => $kategori]);
    }

    public function destroy(int $id)
    {
        Kategori::findOrFail($id)->delete();
        return response()->json(['message' => 'Kategori dihapus']);
    }
}
