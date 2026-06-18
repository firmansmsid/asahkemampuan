<?php

namespace App\Mail;

use App\Models\User;
use App\Models\PaketTryout;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewRegistrationAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public ?PaketTryout $paket = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🆕 Pendaftaran Baru - ' . $this->user->name,
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admin-new-registration');
    }
}
