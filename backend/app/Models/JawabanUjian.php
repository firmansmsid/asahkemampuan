<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JawabanUjian extends Model
{
    protected $table = 'jawaban_ujian';
    protected $fillable = ['sesi_id', 'soal_id', 'jawaban', 'is_benar'];

    protected $casts = ['is_benar' => 'boolean'];

    public function sesi()
    {
        return $this->belongsTo(SesiUjian::class, 'sesi_id');
    }

    public function soal()
    {
        return $this->belongsTo(Soal::class);
    }
}
