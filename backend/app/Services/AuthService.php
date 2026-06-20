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

        // Auto approve disabled, always false
        $autoApprove = false;

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => bcrypt($data['password']),
            'role'        => $role,
            'is_approved' => false,
            'approved_at' => null,
            'referred_by' => $referrerId,
        ]);

        $message = 'Pendaftaran berhasil. Akun Anda sedang menunggu persetujuan admin.';

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
