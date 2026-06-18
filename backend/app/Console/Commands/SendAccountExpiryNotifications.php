<?php

namespace App\Console\Commands;

use App\Mail\AccountExpiryNotification;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendAccountExpiryNotifications extends Command
{
    protected $signature = 'accounts:notify-expiry';
    protected $description = 'Send email notifications to users whose accounts are about to expire (30, 7, 3, 1 days) or have expired';

    public function handle(): int
    {
        $notifyDays = [30, 7, 3, 1, 0]; // days before expiry to send notice
        $sent = 0;

        foreach ($notifyDays as $days) {
            $query = User::whereNotNull('account_expires_at')
                ->where('is_approved', true);

            if ($days === 0) {
                // Expired accounts: notify once
                $query->where('account_expires_at', '<', now())
                      ->where(function ($q) {
                          $q->whereNull('expiry_notified_at')
                            ->orWhere('expiry_notified_at', '<', now()->subDays(7));
                      });
            } else {
                // Upcoming expiry: accounts expiring in exactly N days (±12 hours window)
                $target = now()->addDays($days);
                $query->whereBetween('account_expires_at', [
                    $target->copy()->subHours(12),
                    $target->copy()->addHours(12),
                ])->where(function ($q) use ($target) {
                    $q->whereNull('expiry_notified_at')
                      ->orWhere('expiry_notified_at', '<', $target->copy()->subDays(1));
                });
            }

            $users = $query->get();

            foreach ($users as $user) {
                try {
                    $daysLeft = $user->daysUntilExpiry() ?? 0;
                    Mail::to($user->email)->send(new AccountExpiryNotification($user, $daysLeft));
                    $user->update(['expiry_notified_at' => now()]);
                    $sent++;
                    $this->info("Notified: {$user->name} ({$user->email}) - {$daysLeft} days left");
                } catch (\Exception $e) {
                    $this->error("Failed: {$user->email} - {$e->getMessage()}");
                }
            }
        }

        $this->info("Total notifications sent: {$sent}");
        return 0;
    }
}
