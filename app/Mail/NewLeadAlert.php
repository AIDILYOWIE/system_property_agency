<?php

namespace App\Mail;

use App\Models\Inquiry;
use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewLeadAlert extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $inquiry;
    public $client;
    public $followUpUrl;
    public $crmProfileUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Inquiry $inquiry, Client $client)
    {
        $this->inquiry = $inquiry;
        $this->client = $client;
        // Tracking Redirect CTA
        $this->followUpUrl = url('/api/follow-up/' . $inquiry->id);
        // CRM Profile CTA
        $this->crmProfileUrl = url('/customer/detail/' . $client->id);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjectTitle = $this->inquiry->property ? $this->inquiry->property->title : 'Minat Umum';
        return new Envelope(
            subject: '🚨 [NEW LEAD] - ' . $subjectTitle,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new_lead_alert',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
