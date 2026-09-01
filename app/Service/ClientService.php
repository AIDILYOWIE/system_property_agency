<?php

namespace App\Service;

use App\Models\Client;
use App\Models\Inquiry;
use Exception;
use Illuminate\Support\Facades\DB;

class ClientService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }
    public function storeManualLead(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Format Phone
            $phone = preg_replace('/[^0-9]/', '', $data['phone']);
            if (str_starts_with($phone, '08')) {
                $phone = '628' . substr($phone, 2);
            } elseif (str_starts_with($phone, '8')) {
                $phone = '628' . substr($phone, 1);
            }

            // 2. Check Client
            $client = Client::where('phone', $phone)->first();

            if (!$client) {
                $client = Client::create([
                    'full_name' => $data['fullName'],
                    'phone' => $phone,
                    'email' => $data['email'] ?? null,
                    'source' => $data['source'],
                    'notes' => $data['note'] ?? null,
                    'last_active_at' => now(),
                ]);
            } else {
                $client->update([
                    'last_active_at' => now(),
                ]);
                if (!empty($data['note'])) {
                    $client->update(['notes' => $client->notes ? $client->notes . "\n" . $data['note'] : $data['note']]);
                }
            }

            // 3. Process Property Interests
            if (!empty($data['property_id'])) {
                $propertyId = $data['property_id'];

                $exists = Inquiry::where('customer_id', $client->id)
                    ->where('property_id', $propertyId)
                    ->exists();

                if ($exists) {
                    throw new Exception("Pelanggan ini sudah terdaftar untuk properti yang dipilih.");
                }

                Inquiry::create([
                    'customer_id' => $client->id,
                    'property_id' => $propertyId,
                    'pipeline_status' => 'new_lead'
                ]);
            }

            if ($client->inquiries()->count() === 0) {
                Inquiry::create([
                    'customer_id' => $client->id,
                    'property_id' => null,
                    'pipeline_status' => 'new_lead'
                ]);
            }

            return $client;
        });
    }
}
