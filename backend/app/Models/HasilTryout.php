<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HasilTryout extends Model
{
    protected $table = 'hasil_tryout';
    protected $fillable = [
        'sesi_id', 'user_id', 'paket_id',
        'nilai', 'jumlah_benar', 'jumlah_salah', 'jumlah_kosong',
        'durasi_pengerjaan', 'lulus',
    ];

    protected $casts = ['lulus' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paket()
    {
        return $this->belongsTo(PaketTryout::class, 'paket_id');
    }

    public function sesi()
    {
        return $this->belongsTo(SesiUjian::class, 'sesi_id');
    }

    public function getRankAttribute(): int
    {
        return HasilTryout::where('paket_id', $this->paket_id)
            ->where('nilai', '>', $this->nilai)
            ->count() + 1;
    }
}
