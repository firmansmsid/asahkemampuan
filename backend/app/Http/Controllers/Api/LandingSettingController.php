<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingSetting;
use Illuminate\Http\Request;

class LandingSettingController extends Controller
{
    /**
     * Get all public landing page settings
     */
    public function index()
    {
        $settings = LandingSetting::all()->pluck('value', 'key');
        
        // Provide default values if empty
        if ($settings->isEmpty()) {
            $settings = [
                'hero_slides' => ['Persiapkan Ujian', 'Asah Kemampuan', 'Raih Mimpimu', 'Tingkatkan Karir'],
                'hero_subtitle' => 'Platform Tryout Online Terpercaya #1',
                'hero_description' => 'Latihan soal online dengan ribuan bank soal, timer real-time, dan analisis hasil yang mendalam. Raih nilai terbaik bersama Asah Kemampuan.',
                'stats_1_value' => '10K+', 'stats_1_label' => 'Peserta',
                'stats_2_value' => '500+', 'stats_2_label' => 'Soal Latihan',
                'stats_3_value' => '95%', 'stats_3_label' => 'Tingkat Kelulusan',
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    /**
     * Update landing page settings (Admin Only)
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($data['settings'] as $key => $value) {
            LandingSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan landing page berhasil disimpan.',
            'data' => LandingSetting::all()->pluck('value', 'key')
        ]);
    }
}
