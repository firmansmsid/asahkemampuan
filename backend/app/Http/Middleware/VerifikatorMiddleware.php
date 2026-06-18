<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifikatorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isVerifikator()) {
            return response()->json(['message' => 'Akses ditolak. Hanya verifikator.'], 403);
        }

        return $next($request);
    }
}
