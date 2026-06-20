<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
        .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 32px 24px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 28px 24px; }
        .body h2 { color: #1e293b; font-size: 18px; margin: 0 0 8px; }
        .body p { color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .info-label { color: #94a3b8; }
        .info-value { color: #1e293b; font-weight: 600; }
        .paket-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #fbbf24; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .paket-box h3 { color: #92400e; margin: 0 0 4px; font-size: 15px; }
        .paket-box .price { color: #b45309; font-size: 22px; font-weight: bold; margin: 8px 0 0; }
        .paket-box .free { color: #047857; font-size: 16px; font-weight: bold; margin: 8px 0 0; }
        .alert { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 14px; margin: 16px 0; }
        .alert p { color: #c2410c; margin: 0; font-size: 13px; }
        .footer { text-align: center; padding: 20px 24px; border-top: 1px solid #f1f5f9; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 TryoutPro</h1>
            <p>Platform Ujian Online Terpercaya</p>
        </div>
        <div class="body">
            <h2>Halo, {{ $user->name }}! 👋</h2>
            <p>Selamat! Pendaftaran akun Anda di <strong>TryoutPro</strong> berhasil.</p>

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
                    <span class="info-label">Status</span>
                    <span class="info-value">⏳ Menunggu Persetujuan</span>
                </div>
            </div>

            @if($paket)
            <div class="paket-box">
                <h3>📦 Paket Yang Dipilih:</h3>
                <p style="margin:4px 0 0;color:#78350f;font-size:14px;font-weight:600;">{{ $paket->judul }}</p>
                @if(!$paket->is_gratis && $paket->harga > 0)
                    <p class="price">Rp {{ number_format($paket->harga, 0, ',', '.') }}</p>
                @else
                    <p class="free">✅ Gratis</p>
                @endif
            </div>

            @if(!$paket->is_gratis && $paket->harga > 0)
            <div class="alert">
                <p>💳 <strong>Instruksi Pembayaran:</strong> Silakan lakukan pembayaran sesuai harga paket ke rekening/nomor DANA berikut:</p>
                <p style="text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0; padding: 10px; background: #fed7aa; border-radius: 8px;">DANA: 081250069590</p>
                <p>Akun dan akses paket Anda akan diaktifkan oleh admin setelah pembayaran diverifikasi.</p>
            </div>
            @else
            <div class="alert">
                <p>📩 <strong>Akses akan diberikan</strong> setelah admin menyetujui akun Anda. Anda akan menerima email notifikasi saat akses sudah aktif.</p>
            </div>
            @endif
            @endif

            <p>Akun Anda saat ini menunggu persetujuan admin. Kami akan mengirim email lagi saat akun Anda sudah aktif.</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} TryoutPro. Email ini dikirim otomatis.</p>
        </div>
    </div>
</body>
</html>
