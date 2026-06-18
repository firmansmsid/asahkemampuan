<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaketTryout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$clientKey    = config('services.midtrans.client_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    /** Create payment & get Snap token */
    public function createTransaction(Request $request)
    {
        $request->validate([
            'paket_id' => 'required|exists:paket_tryout,id',
        ]);

        $user  = $request->user();
        $paket = PaketTryout::findOrFail($request->paket_id);

        // Check if paket is free
        if ($paket->is_gratis || $paket->harga <= 0) {
            return response()->json(['message' => 'Paket ini gratis, tidak perlu pembayaran.'], 422);
        }

        // Check if already has access
        $hasAccess = DB::table('user_paket_access')
            ->where('user_id', $user->id)
            ->where('paket_id', $paket->id)
            ->exists();

        if ($hasAccess) {
            return response()->json(['message' => 'Kamu sudah memiliki akses ke paket ini.'], 422);
        }

        // Check existing pending payment
        $existingPayment = Payment::where('user_id', $user->id)
            ->where('paket_id', $paket->id)
            ->where('status', 'pending')
            ->first();

        if ($existingPayment && $existingPayment->snap_token) {
            return response()->json([
                'data' => [
                    'snap_token' => $existingPayment->snap_token,
                    'order_id'   => $existingPayment->order_id,
                    'amount'     => $existingPayment->amount,
                ],
            ]);
        }

        $orderId = 'TRY-' . $user->id . '-' . $paket->id . '-' . time();

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $paket->harga,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
            ],
            'item_details' => [
                [
                    'id'       => 'PAKET-' . $paket->id,
                    'price'    => (int) $paket->harga,
                    'quantity' => 1,
                    'name'     => substr($paket->judul, 0, 50),
                ],
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            $payment = Payment::create([
                'user_id'    => $user->id,
                'paket_id'   => $paket->id,
                'order_id'   => $orderId,
                'snap_token' => $snapToken,
                'amount'     => (int) $paket->harga,
                'status'     => 'pending',
            ]);

            return response()->json([
                'data' => [
                    'snap_token' => $snapToken,
                    'order_id'   => $orderId,
                    'amount'     => (int) $paket->harga,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /** Midtrans webhook callback */
    public function webhook(Request $request)
    {
        $serverKey  = config('services.midtrans.server_key');
        $payload    = $request->all();

        $orderId         = $payload['order_id'] ?? null;
        $statusCode      = $payload['status_code'] ?? null;
        $grossAmount     = $payload['gross_amount'] ?? null;
        $signatureKey    = $payload['signature_key'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $paymentType     = $payload['payment_type'] ?? null;
        $transactionId   = $payload['transaction_id'] ?? null;

        // Verify signature
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        if ($signatureKey !== $expectedSignature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $payment = Payment::where('order_id', $orderId)->first();
        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->update([
            'transaction_id'   => $transactionId,
            'payment_type'     => $paymentType,
            'midtrans_response' => $payload,
        ]);

        if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
            $payment->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            // Grant access
            DB::table('user_paket_access')->insertOrIgnore([
                'user_id'    => $payment->user_id,
                'paket_id'   => $payment->paket_id,
                'granted_at' => now(),
            ]);

            // Create referral commission if user was referred
            $payer = \App\Models\User::find($payment->user_id);
            if ($payer && $payer->referred_by) {
                $referrer = \App\Models\User::find($payer->referred_by);
                if ($referrer) {
                    $pct = $referrer->referral_commission_pct ?? 10;
                    $commissionAmount = floor($payment->amount * $pct / 100);

                    if ($commissionAmount > 0) {
                        \App\Models\ReferralCommission::create([
                            'referrer_id'       => $referrer->id,
                            'referred_id'       => $payer->id,
                            'payment_id'        => $payment->id,
                            'payment_amount'    => $payment->amount,
                            'commission_pct'    => $pct,
                            'commission_amount' => $commissionAmount,
                            'status'            => 'pending',
                        ]);
                    }
                }
            }

            // Create soal commissions for pembuat soal
            $this->createSoalCommissions($payment);

        } elseif (in_array($transactionStatus, ['deny', 'cancel'])) {
            $payment->update(['status' => 'failed']);
        } elseif ($transactionStatus === 'expire') {
            $payment->update(['status' => 'expired']);
        }

        return response()->json(['message' => 'OK']);
    }

    /** Check payment status */
    public function status(Request $request, string $orderId)
    {
        $payment = Payment::with('paket')
            ->where('order_id', $orderId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json(['data' => $payment]);
    }

    /** User payment history */
    public function history(Request $request)
    {
        $payments = Payment::with('paket.kategori')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $payments]);
    }

    /** Create soal commissions for pembuat soal when a paket is purchased */
    private function createSoalCommissions(Payment $payment): void
    {
        try {
            $paketId = $payment->paket_id;

            // Get all verified soal in this paket that were created by pembuat_soal users
            $soalByPembuat = DB::table('paket_soal')
                ->join('soal', 'soal.id', '=', 'paket_soal.soal_id')
                ->join('users', 'users.id', '=', 'soal.created_by')
                ->where('paket_soal.paket_id', $paketId)
                ->where('soal.verification_status', 'verified')
                ->where('users.role', 'pembuat_soal')
                ->whereNotNull('soal.created_by')
                ->select('soal.created_by', DB::raw('COUNT(*) as soal_count'))
                ->groupBy('soal.created_by')
                ->get();

            if ($soalByPembuat->isEmpty()) return;

            $totalSoalInPaket = DB::table('paket_soal')
                ->where('paket_id', $paketId)
                ->count();

            foreach ($soalByPembuat as $row) {
                $pembuat = \App\Models\User::find($row->created_by);
                if (!$pembuat) continue;

                $pct = $pembuat->soal_commission_pct ?? 5;
                // Commission = (soal_count / total_soal) * pct% * payment_amount
                $proportion = $row->soal_count / max($totalSoalInPaket, 1);
                $commissionAmount = floor($payment->amount * $proportion * $pct / 100);

                if ($commissionAmount > 0) {
                    \App\Models\SoalCommission::create([
                        'pembuat_id'       => $pembuat->id,
                        'payment_id'       => $payment->id,
                        'paket_id'         => $paketId,
                        'soal_count'       => $row->soal_count,
                        'total_soal_paket' => $totalSoalInPaket,
                        'payment_amount'   => $payment->amount,
                        'commission_pct'   => $pct,
                        'commission_amount' => $commissionAmount,
                        'status'           => 'pending',
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Soal commission creation failed: ' . $e->getMessage());
        }
    }
}
