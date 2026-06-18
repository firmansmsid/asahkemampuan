<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar',
        'is_approved', 'approved_at',
        'referral_code', 'referred_by', 'referral_commission_pct',
        'soal_commission_pct',
        'account_expires_at', 'expiry_notified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'account_expires_at' => 'datetime',
        'expiry_notified_at' => 'datetime',
        'referral_commission_pct' => 'decimal:2',
        'soal_commission_pct' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            if (empty($user->referral_code)) {
                $user->referral_code = strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPembuatSoal(): bool
    {
        return $this->role === 'pembuat_soal';
    }

    public function isVerifikator(): bool
    {
        return $this->role === 'verifikator';
    }

    /** Check if the user's account has expired */
    public function isAccountExpired(): bool
    {
        return $this->account_expires_at && $this->account_expires_at->isPast();
    }

    /** Days remaining until account expires, null if no expiry set */
    public function daysUntilExpiry(): ?int
    {
        if (!$this->account_expires_at) return null;
        return (int) max(0, now()->diffInDays($this->account_expires_at, false));
    }

    public function sesiUjian()
    {
        return $this->hasMany(SesiUjian::class);
    }

    public function hasil()
    {
        return $this->hasMany(HasilTryout::class);
    }

    /** User who referred this user */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /** Users referred by this user */
    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    /** Commissions earned as referrer */
    public function commissionsEarned()
    {
        return $this->hasMany(ReferralCommission::class, 'referrer_id');
    }

    /** Soal created by this user (pembuat_soal) */
    public function createdSoal()
    {
        return $this->hasMany(Soal::class, 'created_by');
    }

    /** Soal commissions earned as pembuat soal */
    public function soalCommissions()
    {
        return $this->hasMany(SoalCommission::class, 'pembuat_id');
    }
}
