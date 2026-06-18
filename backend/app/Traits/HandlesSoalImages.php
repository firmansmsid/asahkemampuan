<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

trait HandlesSoalImages
{
    /**
     * Upload soal images from the request and return an array of paths.
     */
    protected function uploadSoalImages(Request $request, ?array $existing = null): array
    {
        $imageFields = [
            'gambar_pertanyaan', 'gambar_a', 'gambar_b',
            'gambar_c', 'gambar_d', 'gambar_e', 'gambar_pembahasan',
        ];

        $result = [];
        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                // Delete old file if exists
                if ($existing && !empty($existing[$field])) {
                    Storage::disk('public')->delete($existing[$field]);
                }
                $result[$field] = $request->file($field)->store('soal-images', 'public');
            } elseif ($request->input("remove_{$field}") === '1') {
                // Explicitly remove image
                if ($existing && !empty($existing[$field])) {
                    Storage::disk('public')->delete($existing[$field]);
                }
                $result[$field] = null;
            }
        }

        return $result;
    }

    /**
     * Validate image fields from a request.
     */
    protected function imageValidationRules(): array
    {
        return [
            'gambar_pertanyaan'  => 'nullable|image|max:2048',
            'gambar_a'           => 'nullable|image|max:2048',
            'gambar_b'           => 'nullable|image|max:2048',
            'gambar_c'           => 'nullable|image|max:2048',
            'gambar_d'           => 'nullable|image|max:2048',
            'gambar_e'           => 'nullable|image|max:2048',
            'gambar_pembahasan'  => 'nullable|image|max:2048',
        ];
    }
}
