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

        if ($role === 'pembuat_soal') {
            $message = 'Pendaftaran sebagai Pembuat Soal berhasil. Akun Anda akan diaktifkan setelah disetujui oleh admin.';
        } elseif ($autoApprove) {
            $message = 'Pendaftaran berhasil. Akun Anda langsung aktif, silakan login dan lakukan pembayaran.';
        } else {
            $message = 'Pendaftaran berhasil. Akun Anda akan diaktifkan setelah disetujui oleh admin.';
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

        // Cek apakah akun sudah disetujui admin
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
