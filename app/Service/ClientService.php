<?php

namespace App\Service;

use App\Models\Client;
use App\Models\Inquiry;
use App\Models\Property;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            if (!empty($data['property_ids'])) {
                foreach ($data['property_ids'] as $propertyId) {
                    $exists = Inquiry::where('customer_id', $client->id)
                        ->where('property_id', $propertyId)
                        ->exists();

                    if ($exists) {
                        throw new Exception("Pelanggan ini sudah terdaftar untuk salah satu properti yang dipilih.");
                    }

                    Inquiry::create([
                        'customer_id' => $client->id,
                        'property_id' => $propertyId,
                        'pipeline_status' => 'new_lead'
                    ]);
                }
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

    public function getCustomerDetail($id)
    {
        $client = Client::with(['inquiries.property', 'inquiries.property.mainImage'])->findOrFail($id);

        $primaryInquiry = $client->inquiries->first();
        $primaryProperty = $primaryInquiry ? $primaryInquiry->property : null;

        $properties = $client->inquiries->map(function ($inq) {
            $prop = $inq->property;
            if (!$prop) return null;
            return [
                'id' => $prop->id,
                'title' => $prop->title,
                'location' => $prop->location_area,
                'price' => (float)$prop->price,
                'currency' => $prop->currency,
                'thumbnail' => Storage::url($prop->mainImage->image_path),
                'listingType' => $prop->listing_type === 'sale' ? 'For Sale' : 'For Rent',
                'status' => $prop->status,
                'pipelineStatus' => $inq->pipeline_status,
            ];
        })->filter()->values();

        $timeline = [
            [
                'id' => 'tl-' . uniqid(),
                'date' => $client->created_at->translatedFormat('d M Y'),
                'time' => $client->created_at->format('H:i'),
                'event' => 'Lead masuk dari ' . ucwords(str_replace('-', ' ', $client->source)),
                'detail' => 'Klien dimasukkan ke dalam sistem CRM melalui sumber ' . ucwords(str_replace('-', ' ', $client->source)) . '.',
                'type' => 'created',
            ]
        ];

        return [
            'id' => $client->id,
            'name' => $client->full_name,
            'phone' => $client->phone,
            'email' => $client->email,
            'customer_type' => $primaryProperty ? ($primaryProperty->listing_type === 'sale' ? 'buyer' : 'renter') : 'buyer',
            'pipeline_status' => $primaryInquiry ? $primaryInquiry->pipeline_status : 'new_lead',
            'source' => ucwords(str_replace('-', ' ', $client->source)),
            'notes' => $client->notes ?? '',
            'created_at' => $client->created_at->toIso8601String(),
            'last_contacted' => $client->last_active_at ? $client->last_active_at->toIso8601String() : null,
            'properties' => $properties,
            'timeline' => $timeline,
        ];
    }
    public function getAvailableProperties()
    {
        return Property::with('mainImage')->where('status', 'available')->get()->map(function ($prop) {
            return [
                'id' => $prop->id,
                'title' => $prop->title,
                'location' => $prop->location_area ?? '-',
                'category' => $prop->category ?? 'Property',
                'price' => (float)$prop->price,
                'currency' => $prop->currency,
                'listingType' => $prop->listing_type === 'sale' ? 'For Sale' : 'For Rent',
                'status' => $prop->status,
                'thumbnail' => $prop->mainImage ? \Illuminate\Support\Facades\Storage::url($prop->mainImage->image_path) : null
            ];
        });
    }

    public function updateCustomerNotes($id, $notes)
    {
        $client = Client::findOrFail($id);
        $client->update(['notes' => $notes]);
        return $client;
    }
}
