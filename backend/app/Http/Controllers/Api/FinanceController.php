<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\ReferralCommission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    /** Admin: full financial overview */
    public function adminOverview()
    {
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $totalPending = Payment::where('status', 'pending')->sum('amount');
        $totalCommissions = ReferralCommission::sum('commission_amount');
        $pendingCommissions = ReferralCommission::where('status', 'pending')->sum('commission_amount');
        $paidCommissions = ReferralCommission::where('status', 'paid')->sum('commission_amount');
        $netRevenue = $totalRevenue - $totalCommissions;

        return response()->json(['data' => [
            'total_revenue'       => (int) $totalRevenue,
            'total_pending'       => (int) $totalPending,
            'total_commissions'   => (int) $totalCommissions,
            'pending_commissions' => (int) $pendingCommissions,
            'paid_commissions'    => (int) $paidCommissions,
            'net_revenue'         => (int) $netRevenue,
            'total_transactions'  => Payment::count(),
            'paid_transactions'   => Payment::where('status', 'paid')->count(),
        ]]);
    }

    /** Admin: all payments list */
    public function adminPayments(Request $request)
    {
        $query = Payment::with(['user:id,name,email', 'paket:id,judul']);

        if ($request->filled('status')) $query->where('status', $request->status);

        $payments = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($payments);
    }

    /** Admin: all commissions */
    public function adminCommissions(Request $request)
    {
        $query = ReferralCommission::with([
            'referrer:id,name,email,referral_code',
            'referred:id,name,email',
            'payment:id,order_id,amount,status',
        ]);

        if ($request->filled('status')) $query->where('status', $request->status);

        $commissions = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($commissions);
    }

    /** Admin: update commission status (mark as paid) */
    public function updateCommissionStatus(Request $request, int $id)
    {
        $commission = ReferralCommission::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,paid,cancelled']);
        $commission->update(['status' => $request->status]);

        return response()->json(['message' => 'Status komisi diperbarui', 'data' => $commission]);
    }

    /** Admin: update user commission percentage */
    public function updateUserCommissionPct(Request $request, int $userId)
    {
        $request->validate(['referral_commission_pct' => 'required|numeric|min:0|max:100']);
        $user = User::findOrFail($userId);
        $user->update(['referral_commission_pct' => $request->referral_commission_pct]);

        return response()->json(['message' => "Komisi {$user->name} diubah ke {$request->referral_commission_pct}%", 'data' => $user]);
    }

    /** User: my referral dashboard */
    public function userReferralDashboard(Request $request)
    {
        $user = $request->user();

        $totalEarned = $user->commissionsEarned()->sum('commission_amount');
        $pendingEarned = $user->commissionsEarned()->where('status', 'pending')->sum('commission_amount');
        $paidEarned = $user->commissionsEarned()->where('status', 'paid')->sum('commission_amount');
        $totalReferrals = $user->referrals()->count();

        $recentCommissions = $user->commissionsEarned()
            ->with(['referred:id,name,email', 'payment:id,order_id,amount'])
            ->latest()
            ->take(20)
            ->get();

        $referralList = $user->referrals()
            ->select('id', 'name', 'email', 'created_at', 'is_approved')
            ->latest()
            ->get();

        return response()->json(['data' => [
            'referral_code'     => $user->referral_code,
            'commission_pct'    => $user->referral_commission_pct,
            'total_earned'      => (int) $totalEarned,
            'pending_earned'    => (int) $pendingEarned,
            'paid_earned'       => (int) $paidEarned,
            'total_referrals'   => $totalReferrals,
            'commissions'       => $recentCommissions,
            'referrals'         => $referralList,
        ]]);
    }

    /** Admin: all soal commissions */
    public function adminSoalCommissions(Request $request)
    {
        $query = \App\Models\SoalCommission::with([
            'pembuat:id,name,email',
            'paket:id,judul',
            'payment:id,order_id,amount,status',
        ]);

        if ($request->filled('status')) $query->where('status', $request->status);

        $commissions = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($commissions);
    }

    /** Admin: update soal commission status */
    public function updateSoalCommissionStatus(Request $request, int $id)
    {
        $commission = \App\Models\SoalCommission::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,paid,cancelled']);
        $commission->update(['status' => $request->status]);

        return response()->json(['message' => 'Status komisi soal diperbarui', 'data' => $commission]);
    }

    /** Admin: update user soal commission percentage */
    public function updateUserSoalCommissionPct(Request $request, int $userId)
    {
        $request->validate(['soal_commission_pct' => 'required|numeric|min:0|max:100']);
        $user = User::findOrFail($userId);
        $user->update(['soal_commission_pct' => $request->soal_commission_pct]);

        return response()->json(['message' => "Komisi soal {$user->name} diubah ke {$request->soal_commission_pct}%", 'data' => $user]);
    }
}
