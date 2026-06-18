<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px 24px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 28px 24px; }
        .body h2 { color: #1e293b; font-size: 18px; margin: 0 0 8px; }
        .body p { color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .info-label { color: #94a3b8; }
        .info-value { color: #1e293b; font-weight: 600; }
        .paket-tag { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; margin-top: 4px; }
        .premium-tag { background: #fef3c7; color: #92400e; }
        .cta { display: block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 24px; border-top: 1px solid #f1f5f9; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🆕 Pendaftaran Baru</h1>
            <p>TryoutPro Admin Notification</p>
        </div>
        <div class="body">
            <h2>Ada pendaftar baru!</h2>
            <p>Seorang user baru telah mendaftar di TryoutPro dan menunggu persetujuan Anda.</p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Nama</span>
                    <span class="info-value">{{ $user->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ $user->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Waktu Daftar</span>
                    <span class="info-value">{{ $user->created_at->format('d M Y, H:i') }}</span>
                </div>
                @if($paket)
                <div class="info-row">
                    <span class="info-label">Paket Dipilih</span>
                    <span class="info-value">
                        {{ $paket->judul }}
                        @if(!$paket->is_gratis && $paket->harga > 0)
                            <span class="paket-tag premium-tag">Rp {{ number_format($paket->harga, 0, ',', '.') }}</span>
                        @else
                            <span class="paket-tag">Gratis</span>
                        @endif
                    </span>
                </div>
                @endif
            </div>

            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/dashboard/admin/users" class="cta">
                👤 Review & Setujui Pendaftar
            </a>

            <p style="font-size:12px;color:#94a3b8;">Login ke dashboard admin untuk menyetujui atau menolak pendaftaran ini.</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} TryoutPro. Email ini dikirim otomatis ke admin.</p>
        </div>
    </div>
</body>
</html>
