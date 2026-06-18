<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilTryout;
use App\Models\SesiUjian;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        $totalTryout  = HasilTryout::where('user_id', $userId)->count();
        $rataRata     = HasilTryout::where('user_id', $userId)->avg('nilai') ?? 0;
        $totalLulus   = HasilTryout::where('user_id', $userId)->where('lulus', true)->count();

        // Global rank based on average score
        $userAvg      = round($rataRata, 2);
        $rankGlobal   = HasilTryout::selectRaw('user_id, AVG(nilai) as avg_nilai')
            ->groupBy('user_id')
            ->havingRaw('AVG(nilai) > ?', [$userAvg])
            ->count() + 1;

        return response()->json([
            'data' => [
                'total_tryout'    => $totalTryout,
                'rata_rata_nilai' => round($rataRata, 2),
                'tryout_lulus'    => $totalLulus,
                'rank_global'     => $totalTryout > 0 ? $rankGlobal : null,
            ],
        ]);
    }
}
