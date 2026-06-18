<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SesiUjian extends Model
{
    protected $table = 'sesi_ujian';
    protected $fillable = [
        'user_id', 'paket_id', 'status',
        'mulai_at', 'selesai_at', 'waktu_tersisa',
    ];

    protected $casts = [
        'mulai_at'   => 'datetime',
        'selesai_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paket()
    {
        return $this->belongsTo(PaketTryout::class, 'paket_id');
    }

    public function jawaban()
    {
        return $this->hasMany(JawabanUjian::class, 'sesi_id');
    }

    public function hasil()
    {
        return $this->hasOne(HasilTryout::class, 'sesi_id');
    }
}
