<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\SoalController;
use App\Http\Controllers\Api\PaketTryoutController;
use App\Http\Controllers\Api\UjianController;
use App\Http\Controllers\Api\HasilController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AccessRequestController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PembuatSoalController;
use App\Http\Controllers\Api\VerifikatorController;
use App\Http\Controllers\Api\LandingSettingController;
use App\Http\Controllers\Api\TestimoniController;

use App\Http\Controllers\Api\VerificationController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Email Verification
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::post('/email/resend', [VerificationController::class, 'resend']);

Route::get('/kategori', [KategoriController::class, 'index']);
Route::get('/kategori/{id}', [KategoriController::class, 'show']);
Route::get('/leaderboard', [LeaderboardController::class, 'index']);
Route::get('/paket-list', [PaketTryoutController::class, 'publicList']); // public list for register
Route::get('/landing-settings', [LandingSettingController::class, 'index']);
Route::get('/testimoni', [TestimoniController::class, 'publicList']);

// Midtrans webhook (no auth needed)
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Paket (needs auth to check access)
    Route::get('/paket', [PaketTryoutController::class, 'index']);
    Route::get('/paket/{id}', [PaketTryoutController::class, 'show']);
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Ujian
    Route::prefix('ujian')->group(function () {
        Route::post('/mulai', [UjianController::class, 'mulai']);
        Route::get('/sesi/{id}', [UjianController::class, 'getSesi']);
        Route::post('/sesi/{id}/jawaban', [UjianController::class, 'simpanJawaban']);
        Route::patch('/sesi/{id}/sync-timer', [UjianController::class, 'syncTimer']);
        Route::post('/sesi/{id}/submit', [UjianController::class, 'submit']);
    });

    // Hasil
    Route::get('/hasil', [HasilController::class, 'index']);
    Route::get('/hasil/{id}', [HasilController::class, 'show']);
    Route::get('/hasil/{id}/pembahasan', [HasilController::class, 'pembahasan']);

    // Access Requests (user)
    Route::post('/access-requests', [AccessRequestController::class, 'store']);
    Route::get('/access-requests/my', [AccessRequestController::class, 'myRequests']);

    // Payment
    Route::post('/payment/create', [PaymentController::class, 'createTransaction']);
    Route::get('/payment/status/{orderId}', [PaymentController::class, 'status']);
    Route::get('/payment/history', [PaymentController::class, 'history']);

    // User referral dashboard
    Route::get('/referral/dashboard', [FinanceController::class, 'userReferralDashboard']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        // Admin notification counts
        Route::get('/admin/notifications', function () {
            return response()->json(['data' => [
                'pending_users'    => \App\Models\User::where('is_approved', false)->count(),
                'pending_requests' => \App\Models\AccessRequest::where('status', 'pending')->count(),
                'pending_soal'     => \App\Models\Soal::where('verification_status', 'draft')->count(),
            ]]);
        });
        // User management
        Route::get('/admin/users', [AuthController::class, 'allUsers']);
        Route::get('/admin/users/pending', [AuthController::class, 'pendingUsers']);
        Route::post('/admin/users', [AuthController::class, 'createUser']);
        Route::put('/admin/users/{id}', [AuthController::class, 'updateUser']);
        Route::post('/admin/users/{id}/approve', [AuthController::class, 'approveUser']);
        Route::post('/admin/users/{id}/toggle-active', [AuthController::class, 'toggleActive']);
        Route::post('/admin/users/{id}/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/admin/users/{id}/update-expiry', [AuthController::class, 'updateExpiry']);
        Route::delete('/admin/users/{id}/reject', [AuthController::class, 'rejectUser']);
        Route::delete('/admin/users/{id}', [AuthController::class, 'deleteUser']);

        // Kategori
        Route::post('/kategori', [KategoriController::class, 'store']);
        Route::put('/kategori/{id}', [KategoriController::class, 'update']);
        Route::delete('/kategori/{id}', [KategoriController::class, 'destroy']);

        // Soal
        Route::apiResource('soal', SoalController::class);
        Route::post('/soal-import', [SoalController::class, 'import']);
        Route::get('/soal-template', [SoalController::class, 'downloadTemplate']);

        // Paket
        Route::post('/paket', [PaketTryoutController::class, 'store']);
        Route::put('/paket/{id}', [PaketTryoutController::class, 'update']);
        Route::delete('/paket/{id}', [PaketTryoutController::class, 'destroy']);
        Route::post('/paket/{id}/soal', [PaketTryoutController::class, 'attachSoal']);
        Route::delete('/paket/{id}/soal/{soalId}', [PaketTryoutController::class, 'detachSoal']);

        // Paket Access Control
        Route::post('/paket/{id}/access', [PaketTryoutController::class, 'setAccessMode']);
        Route::get('/paket/{id}/users', [PaketTryoutController::class, 'getAllowedUsers']);
        Route::post('/paket/{id}/users', [PaketTryoutController::class, 'assignUsers']);
        Route::delete('/paket/{id}/users/{userId}', [PaketTryoutController::class, 'revokeUser']);

        // Access Requests (admin)
        Route::get('/admin/access-requests', [AccessRequestController::class, 'index']);
        Route::post('/admin/access-requests/{id}/approve', [AccessRequestController::class, 'approve']);
        Route::post('/admin/access-requests/{id}/reject', [AccessRequestController::class, 'reject']);

        // Finance & Referral Management
        Route::get('/admin/finance/overview', [FinanceController::class, 'adminOverview']);
        Route::get('/admin/finance/payments', [FinanceController::class, 'adminPayments']);
        Route::get('/admin/finance/commissions', [FinanceController::class, 'adminCommissions']);
        Route::put('/admin/finance/commissions/{id}', [FinanceController::class, 'updateCommissionStatus']);
        Route::put('/admin/users/{id}/commission', [FinanceController::class, 'updateUserCommissionPct']);
        Route::put('/admin/users/{id}/soal-commission', [FinanceController::class, 'updateUserSoalCommissionPct']);

        // Soal Commissions (admin)
        Route::get('/admin/finance/soal-commissions', [FinanceController::class, 'adminSoalCommissions']);
        Route::get('/admin/finance/soal-commissions', [FinanceController::class, 'adminSoalCommissions']);
        Route::put('/admin/finance/soal-commissions/{id}', [FinanceController::class, 'updateSoalCommissionStatus']);
        
        // Landing Settings
        Route::put('/admin/landing-settings', [LandingSettingController::class, 'update']);

        // Testimoni
        Route::apiResource('admin/testimoni', TestimoniController::class);
    });

    // Pembuat Soal routes
    Route::middleware('pembuat_soal')->prefix('pembuat-soal')->group(function () {
        Route::get('/soal', [PembuatSoalController::class, 'mySoal']);
        Route::post('/soal', [PembuatSoalController::class, 'store']);
        Route::put('/soal/{id}', [PembuatSoalController::class, 'update']);
        Route::delete('/soal/{id}', [PembuatSoalController::class, 'destroy']);
        Route::get('/komisi', [PembuatSoalController::class, 'commissionDashboard']);
    });

    // Verifikator routes
    Route::middleware('verifikator')->prefix('verifikator')->group(function () {
        Route::get('/soal', [VerifikatorController::class, 'pendingSoal']);
        Route::get('/soal/{id}', [VerifikatorController::class, 'show']);
        Route::post('/soal/{id}/approve', [VerifikatorController::class, 'approve']);
        Route::post('/soal/{id}/reject', [VerifikatorController::class, 'reject']);
    });
});
