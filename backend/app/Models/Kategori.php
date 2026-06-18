<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Kategori extends Model
{
    use HasFactory;

    protected $table = 'kategori';
    protected $fillable = ['nama', 'slug', 'deskripsi', 'icon'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->nama);
            }
        });
    }

    public function paket()
    {
        return $this->hasMany(PaketTryout::class, 'kategori_id');
    }

    public function soal()
    {
        return $this->hasMany(Soal::class, 'kategori_id');
    }
}
