<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilTryout;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $query = HasilTryout::with('user', 'paket')
            ->select('hasil_tryout.*')
            ->orderByDesc('nilai')
            ->orderBy('durasi_pengerjaan');

        if ($request->filled('paket_id')) {
            $query->where('paket_id', $request->paket_id);
        }

        // Get best score per user
        $leaderboard = $query
            ->get()
            ->unique('user_id')
            ->values()
            ->take(50)
            ->map(function ($item, $index) {
                return [
                    'rank'       => $index + 1,
                    'user'       => $item->user,
                    'nilai'      => $item->nilai,
                    'durasi'     => $item->durasi_pengerjaan,
                    'paket'      => $item->paket,
                    'created_at' => $item->created_at,
                ];
            });

        return response()->json(['data' => $leaderboard]);
    }
}
