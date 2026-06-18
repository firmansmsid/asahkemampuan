<?php

namespace App\Mail;

use App\Models\User;
use App\Models\PaketTryout;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccessApprovedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public PaketTryout $paket,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✅ Akses Paket Disetujui - TryoutPro',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.access-approved');
    }
}
