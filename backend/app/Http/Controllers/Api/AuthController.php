<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users',
            'password'      => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)],
            'paket_id'      => 'nullable|exists:paket_tryout,id',
            'referral_code' => 'nullable|string|max:10',
            'role'          => 'nullable|in:peserta,pembuat_soal',
        ]);

        $paket = null;
        $isPremium = false;
        if (!empty($data['paket_id'])) {
            $paket = \App\Models\PaketTryout::find($data['paket_id']);
            $isPremium = $paket && !$paket->is_gratis && $paket->harga > 0;
        }

        // Auto-approve if premium (they'll pay), otherwise need admin approval
        $result = $this->authService->register($data, $isPremium);
        $user = $result['user'];

        // If paket selected, auto-create access request
        if ($paket) {
            \App\Models\AccessRequest::create([
                'user_id'  => $user->id,
                'paket_id' => $paket->id,
                'pesan'    => $isPremium
                    ? 'Pendaftaran baru - paket premium, menunggu pembayaran'
                    : 'Pendaftaran baru - menunggu persetujuan admin',
                'status'   => 'pending',
            ]);
        }

        // Send email to the user
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->send(new \App\Mail\RegistrationNotification($user, $paket));
        } catch (\Exception $e) {
            \Log::error('Registration email failed: ' . $e->getMessage());
        }

        // Send email to ALL admins
        try {
            $admins = User::where('role', 'admin')->pluck('email');
            foreach ($admins as $adminEmail) {
                \Illuminate\Support\Facades\Mail::to($adminEmail)
                    ->send(new \App\Mail\NewRegistrationAdminNotification($user, $paket));
            }
        } catch (\Exception $e) {
            \Log::error('Admin notification email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => $result['message'],
            'data'    => [
                'user'       => $user,
                'paket'      => $paket,
                'is_premium' => $isPremium,
                'auto_approved' => $isPremium,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->authService->login($data);

        return response()->json([
            'message' => 'Login berhasil',
            'data'    => $result,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $data = $user->toArray();
        $data['account_expired'] = $user->isAccountExpired();
        $data['days_until_expiry'] = $user->daysUntilExpiry();
        return response()->json(['data' => $data]);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $user = $request->user();
        $user->update($data);
        return response()->json(['message' => 'Profil diperbarui', 'data' => $user]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);
        $request->user()->update(['password' => bcrypt($request->password)]);
        return response()->json(['message' => 'Password berhasil diubah']);
    }

    // ============= Admin: Kelola User =============

    /** List all pending users (admin only via route middleware) */
    public function pendingUsers()
    {
        $users = User::where('is_approved', false)->latest()->get();
        return response()->json(['data' => $users]);
    }

    /** List all users */
    public function allUsers(Request $request)
    {
        $query = User::query();
        if ($request->filled('status')) {
            $query->where('is_approved', $request->status === 'approved');
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        $users = $query->latest()->get()->map(function ($user) {
            $data = $user->toArray();
            $data['account_expired'] = $user->isAccountExpired();
            $data['days_until_expiry'] = $user->daysUntilExpiry();
            return $data;
        });
        return response()->json(['data' => $users]);
    }

    /** Approve a user */
    public function approveUser(int $id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'is_approved' => true,
            'approved_at' => now(),
            'account_expires_at' => now()->addYear(),
        ]);

        // Send approval notification email
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->send(new \App\Mail\AccountApprovedNotification($user));
        } catch (\Exception $e) {
            \Log::error('Account approval email failed: ' . $e->getMessage());
        }

        return response()->json(['message' => "User {$user->name} telah disetujui (aktif hingga " . $user->account_expires_at->format('d M Y') . ')', 'data' => $user]);
    }

    /** Reject / delete a user */
    public function rejectUser(int $id)
    {
        $user = User::findOrFail($id);
        $name = $user->name;
        $user->delete();
        return response()->json(['message' => "User {$name} telah ditolak dan dihapus"]);
    }

    /** Delete a user permanently */
    public function deleteUser(int $id)
    {
        $user = User::findOrFail($id);
        $name = $user->name;
        $user->delete();
        return response()->json(['message' => "User {$name} berhasil dihapus"]);
    }

    /** Toggle user active/inactive */
    public function toggleActive(int $id)
    {
        $user = User::findOrFail($id);
        $newStatus = !$user->is_approved;
        $user->update([
            'is_approved' => $newStatus,
            'approved_at' => $newStatus ? now() : null,
        ]);
        $status = $newStatus ? 'diaktifkan' : 'dinonaktifkan';
        return response()->json(['message' => "User {$user->name} {$status}", 'data' => $user]);
    }

    /** Admin creates a new user (auto-approved) with optional paket access */
    public function createUser(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|string|min:6',
            'role'       => 'required|in:admin,peserta,pembuat_soal,verifikator',
            'paket_ids'  => 'nullable|array',
            'paket_ids.*'=> 'exists:paket_tryout,id',
        ]);

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => bcrypt($data['password']),
            'role'        => $data['role'],
            'is_approved' => true,
            'approved_at' => now(),
            'account_expires_at' => now()->addYear(),
        ]);

        // Assign paket access
        if (!empty($data['paket_ids'])) {
            $rows = collect($data['paket_ids'])->map(fn($pid) => [
                'user_id'    => $user->id,
                'paket_id'   => $pid,
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ])->toArray();
            \DB::table('user_paket_access')->insert($rows);
        }

        return response()->json(['message' => "User {$user->name} berhasil dibuat", 'data' => $user], 201);
    }

    /** Admin: update user details (name, email, role) */
    public function updateUser(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role'  => 'sometimes|in:admin,peserta,pembuat_soal,verifikator',
        ]);

        $user->update($data);

        return response()->json(['message' => "User {$user->name} berhasil diperbarui", 'data' => $user]);
    }

    /** Admin: reset user password */
    public function resetPassword(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->update(['password' => bcrypt($data['password'])]);

        return response()->json(['message' => "Password {$user->name} berhasil direset"]);
    }

    /** Admin: update user account expiry date */
    public function updateExpiry(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'account_expires_at' => 'required|date|after:today',
        ]);

        $user->update([
            'account_expires_at' => $data['account_expires_at'],
            'expiry_notified_at' => null, // reset notification flag
        ]);

        return response()->json([
            'message' => "Masa aktif {$user->name} diperbarui hingga " . \Carbon\Carbon::parse($data['account_expires_at'])->format('d M Y'),
            'data' => $user,
        ]);
    }
}
