<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaketTryout extends Model
{
    use HasFactory;

    protected $table = 'paket_tryout';
    protected $fillable = [
        'kategori_id', 'judul', 'slug', 'deskripsi',
        'durasi', 'jumlah_soal', 'passing_grade',
        'is_gratis', 'harga', 'status', 'thumbnail', 'access_mode',
    ];

    protected $casts = [
        'is_gratis' => 'boolean',
        'harga'     => 'decimal:0',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->judul);
            }
        });
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function soal()
    {
        return $this->belongsToMany(Soal::class, 'paket_soal', 'paket_id', 'soal_id')
                    ->withPivot('urutan')
                    ->orderBy('paket_soal.urutan');
    }

    public function sesiUjian()
    {
        return $this->hasMany(SesiUjian::class, 'paket_id');
    }

    public function hasil()
    {
        return $this->hasMany(HasilTryout::class, 'paket_id');
    }

    public function allowedUsers()
    {
        return $this->belongsToMany(User::class, 'user_paket_access', 'paket_id', 'user_id')
                    ->withTimestamps();
    }

    public function getPesertaCountAttribute()
    {
        return $this->sesiUjian()->distinct('user_id')->count('user_id');
    }
}
