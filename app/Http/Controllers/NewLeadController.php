<?php

namespace App\Http\Controllers;

use App\Notifications\NewLead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class NewLeadController extends Controller
{
    public function index()
    {
        $data = [
            'hi' => 'Hello Sayang',
            'wish' => 'Semoga kamu bahagia selalu'
        ];

        // Mengirim notifikasi menggunakan On-Demand Notifications (tanpa model User)
        Notification::route('mail', 'test@example.com')
            ->notify(new NewLead($data));

        dd("sent notification...");
    }
}
