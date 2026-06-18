<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    /**
     * Verify the user's email address.
     */
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Link verifikasi tidak valid.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect(env('NEXT_PUBLIC_FRONTEND_URL', 'https://asahkemampuan.web.id') . '/login?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect(env('NEXT_PUBLIC_FRONTEND_URL', 'https://asahkemampuan.web.id') . '/login?verified=1');
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak ditemukan.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah diverifikasi.'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Link verifikasi berhasil dikirim ulang. Silakan cek email Anda.']);
    }
}
