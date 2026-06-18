<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PembuatSoalMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isPembuatSoal()) {
            return response()->json(['message' => 'Akses ditolak. Hanya pembuat soal.'], 403);
        }

        return $next($request);
    }
}
