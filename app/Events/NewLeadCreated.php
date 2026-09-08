<?php

namespace App\Events;

use App\Models\Inquiry;
use App\Models\Client;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewLeadCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $inquiry;
    public $client;

    /**
     * Create a new event instance.
     */
    public function __construct(Inquiry $inquiry, Client $client)
    {
        $this->inquiry = $inquiry;
        $this->client = $client;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
