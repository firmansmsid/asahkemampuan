<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data, bool $autoApprove = false): array
    {
        // Resolve referrer from referral code
        $referrerId = null;
        if (!empty($data['referral_code'])) {
            $referrer = User::where('referral_code', strtoupper($data['referral_code']))->first();
            if ($referrer) {
                $referrerId = $referrer->id;
            }
        }

        $role = $data['role'] ?? 'peserta';

        // Option B: Auto approve peserta
        if ($role === 'peserta') {
            $autoApprove = true;
        }

        // Pembuat soal always requires admin approval
        if ($role === 'pembuat_soal') {
            $autoApprove = false;
        }

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => bcrypt($data['password']),
            'role'        => $role,
            'is_approved' => $autoApprove,
            'approved_at' => $autoApprove ? now() : null,
            'referred_by' => $referrerId,
        ]);

        // Kirim email verifikasi bawaan Laravel
        $user->sendEmailVerificationNotification();

        if ($role === 'pembuat_soal') {
            $message = 'Pendaftaran sebagai Pembuat Soal berhasil. Silakan cek email Anda untuk verifikasi, lalu tunggu persetujuan admin.';
        } else {
            $message = 'Pendaftaran berhasil. Silakan cek email Anda untuk melakukan verifikasi akun.';
        }

        return [
            'user'    => $user,
            'message' => $message,
        ];
    }

    public function login(array $data): array
    {
        if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = Auth::user();

        // Cek apakah email sudah diverifikasi
        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Email belum diverifikasi'], // Used by frontend to show resend button
            ]);
        }

        // Cek apakah akun sudah disetujui admin (jika role butuh approval)
        if (!$user->is_approved) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Akun Anda belum disetujui oleh admin. Silakan tunggu persetujuan.'],
            ]);
        }

        $user->tokens()->delete(); // revoke old tokens
        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}
