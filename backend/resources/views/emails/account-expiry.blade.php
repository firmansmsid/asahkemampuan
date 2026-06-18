<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .header { background: linear-gradient(135deg, {{ $daysLeft <= 0 ? '#ef4444, #dc2626' : ($daysLeft <= 7 ? '#f59e0b, #d97706' : '#3b82f6, #2563eb') }}); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .header p { color: rgba(255,255,255,.85); margin: 8px 0 0; font-size: 14px; }
        .body { padding: 30px; }
        .body p { color: #475569; line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
        .alert-box { padding: 16px 20px; border-radius: 12px; margin: 16px 0; font-weight: 600; font-size: 15px; text-align: center; }
        .alert-expired { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .alert-warning { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .alert-info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .footer { padding: 20px 30px; background: #f8fafc; text-align: center; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Pemberitahuan Masa Aktif Akun</h1>
            <p>TryoutPro - Platform Ujian Online</p>
        </div>
        <div class="body">
            <p>Halo <strong>{{ $user->name }}</strong>,</p>

            @if($daysLeft <= 0)
                <div class="alert-box alert-expired">
                    ❌ Akun Anda telah kedaluwarsa sejak {{ $user->account_expires_at->format('d M Y') }}
                </div>
                <p>Akun Anda sudah melewati masa aktif. Anda masih bisa login, tetapi <strong>tidak dapat mengakses materi tryout</strong>.</p>
                <p>Silakan hubungi admin untuk memperpanjang masa aktif akun Anda.</p>
            @else
                <div class="alert-box {{ $daysLeft <= 7 ? 'alert-warning' : 'alert-info' }}">
                    ⏳ Masa aktif akun Anda tinggal <strong>{{ $daysLeft }} hari</strong> lagi
                    (berakhir {{ $user->account_expires_at->format('d M Y') }})
                </div>
                <p>Setelah masa aktif berakhir, Anda masih bisa login tetapi <strong>tidak dapat mengakses materi tryout</strong>.</p>
                <p>Silakan hubungi admin untuk memperpanjang akun Anda sebelum waktu habis.</p>
            @endif
        </div>
        <div class="footer">
            <p>Email ini dikirim otomatis oleh TryoutPro. Jangan balas email ini.</p>
        </div>
    </div>
</body>
</html>
