<?php

namespace App\Listeners;

use App\Events\NewLeadCreated;
use App\Mail\NewLeadAlert;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendNewLeadEmailNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NewLeadCreated $event): void
    {
        // Owner's email
        $ownerEmail = config('mail.from.address', 'admin@azanproperti.com');
        Mail::to($ownerEmail)->send(new NewLeadAlert($event->inquiry, $event->client));
    }
}
