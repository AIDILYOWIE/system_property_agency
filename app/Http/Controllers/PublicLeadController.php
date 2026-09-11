<?php

namespace App\Http\Controllers;

use App\Events\NewLeadCreated;
use App\Models\Client;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\CustomerActivity;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

class PublicLeadController extends Controller
{
    public function store(Request $request)
    {
        // IP-based Rate Limiting (5 per minute)
        $executed = RateLimiter::attempt(
            'new-lead:' . $request->ip(),
            5,
            function () use ($request) {
                $this->processLead($request);
            },
            60
        );

        if (!$executed) {
            return response()->json(['message' => 'Too many requests. Please try again later.'], 429);
        }

        return response()->json(['message' => 'Thank you. Our agent will contact you shortly.'], 200);
    }

    private function processLead(Request $request)
    {
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'property_id' => 'required|exists:properties,id',
            'source' => 'nullable|string',
            'utm_medium' => 'nullable|string|max:255',
            'referrer' => 'nullable|string|max:2000'
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Format Phone
            $phone = preg_replace('/[^0-9]/', '', $validated['phone']);
            if (str_starts_with($phone, '08')) {
                $phone = '628' . substr($phone, 2);
            } elseif (str_starts_with($phone, '8')) {
                $phone = '628' . substr($phone, 1);
            }

            // 2. Client Deduplication
            $client = Client::where('phone', $phone)->first();
            $source = $validated['source'] ?? 'website';

            if (!$client) {
                $client = Client::create([
                    'full_name' => $validated['fullName'],
                    'phone' => $phone,
                    'email' => $validated['email'] ?? null,
                    'source' => $source,
                    'last_active_at' => now(),
                    'utm_medium' => $validated['utm_medium'] ?? null,
                    'referrer' => $validated['referrer'] ?? null,
                ]);

                CustomerActivity::create([
                    'customer_id' => $client->id,
                    'action_type' => 'created',
                    'description' => 'Klien submit form via ' . ucwords(str_replace('-', ' ', $source)) . '.',
                    'new_values' => ['title' => 'New Lead dari ' . ucwords(str_replace('-', ' ', $source))]
                ]);
            } else {
                $client->update([
                    'last_active_at' => now(),
                    // Optionally update name if new one is provided but typically keep original
                ]);
            }

            // 3. Process Inquiry
            $inquiry = Inquiry::where('customer_id', $client->id)
                ->where('property_id', $validated['property_id'])
                ->first();

            if (!$inquiry) {
                $inquiry = Inquiry::create([
                    'customer_id' => $client->id,
                    'property_id' => $validated['property_id'],
                    'pipeline_status' => 'new_lead'
                ]);

                $prop = Property::find($validated['property_id']);
                if ($prop) {
                    CustomerActivity::create([
                        'customer_id' => $client->id,
                        'action_type' => 'property',
                        'description' => 'Klien menanyakan properti: ' . $prop->title . ' via website.',
                        'new_values' => ['title' => 'Pertanyaan properti baru']
                    ]);
                }

                // Dispatch event only for NEW inquiries
                event(new NewLeadCreated($inquiry, $client));
            } else {
                // Already inquired about this property before, just update timestamp and maybe status if needed
                // It doesn't trigger email again to prevent spam
                $inquiry->touch();
            }
        });
    }
}
