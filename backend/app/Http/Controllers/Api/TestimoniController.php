<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimoni;
use Illuminate\Http\Request;

class TestimoniController extends Controller
{
    /**
     * Get active testimonials for public landing page
     */
    public function publicList()
    {
        $testimonis = Testimoni::where('is_active', true)->orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $testimonis
        ]);
    }

    /**
     * Get all testimonials (Admin)
     */
    public function index()
    {
        $testimonis = Testimoni::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $testimonis
        ]);
    }

    /**
     * Store a new testimonial
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $testimoni = Testimoni::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Testimoni berhasil ditambahkan',
            'data' => $testimoni
        ], 201);
    }

    /**
     * Update the specified testimonial
     */
    public function update(Request $request, $id)
    {
        $testimoni = Testimoni::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'nullable|string|max:255',
            'content' => 'sometimes|required|string',
            'is_active' => 'boolean',
        ]);

        $testimoni->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Testimoni berhasil diperbarui',
            'data' => $testimoni
        ]);
    }

    /**
     * Remove the specified testimonial
     */
    public function destroy($id)
    {
        $testimoni = Testimoni::findOrFail($id);
        $testimoni->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Testimoni berhasil dihapus'
        ]);
    }
}
