<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    use HasFactory;

    protected $table = 'soal';
    protected $fillable = [
        'kategori_id', 'pertanyaan', 'gambar_pertanyaan',
        'pilihan_a', 'gambar_a', 'pilihan_b', 'gambar_b',
        'pilihan_c', 'gambar_c', 'pilihan_d', 'gambar_d',
        'pilihan_e', 'gambar_e',
        'kunci_jawaban', 'pembahasan', 'gambar_pembahasan', 'bobot',
        'created_by', 'verification_status', 'verified_by', 'verified_at', 'rejection_note',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function paket()
    {
        return $this->belongsToMany(PaketTryout::class, 'paket_soal', 'soal_id', 'paket_id');
    }

    /** The user who created this soal (pembuat_soal role) */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** The verifikator who verified/rejected this soal */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
