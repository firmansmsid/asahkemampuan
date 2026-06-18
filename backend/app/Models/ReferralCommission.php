<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralCommission extends Model
{
    protected $fillable = [
        'referrer_id', 'referred_id', 'payment_id',
        'payment_amount', 'commission_pct', 'commission_amount',
        'status',
    ];

    protected $casts = [
        'payment_amount'    => 'decimal:0',
        'commission_pct'    => 'decimal:2',
        'commission_amount' => 'decimal:0',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
