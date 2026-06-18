<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px 24px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 28px 24px; }
        .body h2 { color: #1e293b; font-size: 18px; margin: 0 0 8px; }
        .body p { color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
        .success-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center; }
        .success-box .icon { font-size: 40px; margin-bottom: 8px; }
        .success-box h3 { color: #065f46; margin: 0 0 4px; font-size: 16px; }
        .success-box p { color: #047857; margin: 0; font-size: 13px; }
        .cta { display: block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 24px; border-top: 1px solid #f1f5f9; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Akun Disetujui!</h1>
            <p>TryoutPro - Platform Ujian Online</p>
        </div>
        <div class="body">
            <h2>Halo, {{ $user->name }}! 🎉</h2>
            <p>Kabar baik! Akun Anda di <strong>TryoutPro</strong> telah disetujui oleh admin.</p>

            <div class="success-box">
                <div class="icon">🎓</div>
                <h3>Akun Anda Aktif!</h3>
                <p>Silakan login untuk mulai mengerjakan tryout.</p>
            </div>

            <p>Anda sekarang bisa login dan mengakses paket tryout yang tersedia. Jika ada paket premium, silakan lakukan pembayaran melalui dashboard.</p>

            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/login" class="cta">
                🚀 Login Sekarang
            </a>

            <p style="font-size:12px;color:#94a3b8;">Jika tombol di atas tidak berfungsi, salin link berikut: {{ config('app.frontend_url', 'http://localhost:3000') }}/login</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} TryoutPro. Email ini dikirim otomatis.</p>
        </div>
    </div>
</body>
</html>
