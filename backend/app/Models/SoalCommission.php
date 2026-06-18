<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoalCommission extends Model
{
    protected $fillable = [
        'pembuat_id', 'payment_id', 'paket_id',
        'soal_count', 'total_soal_paket',
        'payment_amount', 'commission_pct', 'commission_amount',
        'status',
    ];

    protected $casts = [
        'payment_amount'    => 'decimal:0',
        'commission_pct'    => 'decimal:2',
        'commission_amount' => 'decimal:0',
    ];

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'pembuat_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function paket()
    {
        return $this->belongsTo(PaketTryout::class, 'paket_id');
    }
}
