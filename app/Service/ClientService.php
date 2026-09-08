<?php

namespace App\Service;

use App\Events\NewLeadCreated;
use App\Models\Client;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\CustomerActivity;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

                CustomerActivity::create([
                    'customer_id' => $client->id,
                    'action_type' => 'created',
                    'description' => 'Klien dimasukkan ke dalam sistem CRM melalui sumber ' . ucwords(str_replace('-', ' ', $client->source)) . '.',
                    'new_values' => ['title' => 'Lead masuk dari ' . ucwords(str_replace('-', ' ', $client->source))]
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

                    $newInquiry = Inquiry::create([
                        'customer_id' => $client->id,
                        'property_id' => $propertyId,
                        'pipeline_status' => 'new_lead'
                    ]);

                    event(new NewLeadCreated($newInquiry, $client));
                }
            }

            if ($client->inquiries()->count() === 0) {
                $newGeneralInquiry = Inquiry::create([
                    'customer_id' => $client->id,
                    'property_id' => null,
                    'pipeline_status' => 'new_lead'
                ]);

                event(new NewLeadCreated($newGeneralInquiry, $client));
            }

            return $client;
        });
    }

    public function getCustomerDetail($id)
    {
        $client = Client::with(['inquiries.property', 'inquiries.property.mainImage'])->findOrFail($id);

        $statusWeight = [
            'lost' => -1,
            'new_lead' => 0,
            'contacted' => 1,
            'viewing' => 2,
            'negotiation' => 3,
            'won' => 4,
        ];

        $primaryInquiry = $client->inquiries->sortByDesc(function ($inq) use ($statusWeight) {
            return $statusWeight[$inq->pipeline_status] ?? 0;
        })->first();

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

        $timeline = CustomerActivity::where('customer_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => (string)$log->id,
                    'date' => $log->created_at->translatedFormat('d M Y'),
                    'time' => $log->created_at->format('H:i'),
                    'event' => $log->new_values['title'] ?? 'Aktivitas Klien',
                    'detail' => $log->description,
                    'type' => $log->action_type,
                ];
            })->values();

        $total_interaction = CustomerActivity::where('customer_id', $client->id)->count();

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
            'total_interaction' => $total_interaction,
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
                'thumbnail' => $prop->mainImage ? Storage::url($prop->mainImage->image_path) : null
            ];
        });
    }

    public function updateCustomerNotes($id, $notes)
    {
        return DB::transaction(function () use ($id, $notes) {
            $client = Client::findOrFail($id);
            $oldNotes = $client->notes;

            if ($oldNotes !== $notes) {
                $client->update(['notes' => $notes]);

                CustomerActivity::create([
                    'customer_id' => $client->id,
                    'action_type' => 'note',
                    'description' => $notes ? Str::limit($notes, 50) : 'Catatan dihapus',
                    'new_values' => ['title' => 'Catatan klien diperbarui']
                ]);
            }
            return $client;
        });
    }

    public function updateCustomer($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $client = Client::findOrFail($id);

            // 1. Format Phone
            $phone = preg_replace('/[^0-9]/', '', $data['phone']);
            if (str_starts_with($phone, '08')) {
                $phone = '628' . substr($phone, 2);
            } elseif (str_starts_with($phone, '8')) {
                $phone = '628' . substr($phone, 1);
            }

            // 2. Update Client Details
            $oldData = $client->only(['full_name', 'phone', 'email', 'source']);
            $client->update([
                'full_name' => $data['fullName'],
                'phone' => $phone,
                'email' => $data['email'] ?? null,
                'source' => $data['source'],
                'notes' => $data['note'] ?? null,
            ]);

            $changedFields = [];
            if ($oldData['full_name'] !== $client->full_name) $changedFields[] = 'nama';
            if ($oldData['phone'] !== $client->phone) $changedFields[] = 'nomor WA';
            if ($oldData['email'] !== $client->email) $changedFields[] = 'email';
            if ($oldData['source'] !== $client->source) $changedFields[] = 'sumber prospek';

            if (!empty($changedFields)) {
                $descList = implode(', ', $changedFields);
                $descList = preg_replace('/,([^,]*)$/', ' dan$1', $descList); // proper indonesian "dan"
                CustomerActivity::create([
                    'customer_id' => $client->id,
                    'action_type' => 'contact',
                    'description' => 'Terdapat perubahan pada ' . $descList . ' pelanggan.',
                    'new_values' => ['title' => 'Profil informasi diperbarui'],
                    'old_values' => $oldData
                ]);
            }

            // 3. Sync Properties (Inquiries)
            if (!empty($data['property_ids'])) {
                $deletedObj = Inquiry::with('property')
                    ->where('customer_id', $client->id)
                    ->whereNotIn('property_id', $data['property_ids'])
                    ->get();

                foreach ($deletedObj as $delInq) {
                    if ($delInq->property) {
                        CustomerActivity::create([
                            'customer_id' => $client->id,
                            'action_type' => 'property',
                            'description' => 'Menghapus properti: ' . $delInq->property->title . ' dari daftar minat.',
                            'new_values' => ['title' => 'Minat pada properti dibatalkan']
                        ]);
                    }
                }

                Inquiry::where('customer_id', $client->id)
                    ->whereNotIn('property_id', $data['property_ids'])
                    ->delete();

                foreach ($data['property_ids'] as $propertyId) {
                    $exists = Inquiry::where('customer_id', $client->id)
                        ->where('property_id', $propertyId)
                        ->exists();

                    if (!$exists) {
                        $newInq = Inquiry::create([
                            'customer_id' => $client->id,
                            'property_id' => $propertyId,
                            'pipeline_status' => 'new_lead'
                        ]);
                        $prop = Property::find($propertyId);
                        if ($prop) {
                            CustomerActivity::create([
                                'customer_id' => $client->id,
                                'action_type' => 'property',
                                'description' => 'Menambahkan properti: ' . $prop->title . ' ke daftar minat.',
                                'new_values' => ['title' => 'Klien menunjukkan minat baru']
                            ]);
                        }
                    }
                }
            } else {
                // No properties
                Inquiry::where('customer_id', $client->id)->whereNotNull('property_id')->delete();
                if ($client->inquiries()->count() === 0) {
                    Inquiry::create([
                        'customer_id' => $client->id,
                        'property_id' => null,
                        'pipeline_status' => 'new_lead'
                    ]);
                }
            }

            return $client;
        });
    }

    public function followUpCustomer($id, array $propertyIds)
    {
        return DB::transaction(function () use ($id, $propertyIds) {
            $client = Client::findOrFail($id);
            $client->update(['last_active_at' => now()]);

            $query = Inquiry::where('customer_id', $id)->where('pipeline_status', 'new_lead');

            if (empty($propertyIds)) {
                $query->whereNull('property_id');
            } else {
                $query->whereIn('property_id', $propertyIds);
            }

            $query->update(['pipeline_status' => 'contacted']);

            // Get property titles for detail log
            $propertyNames = Property::whereIn('id', $propertyIds)->pluck('title')->toArray();
            $propString = empty($propertyNames) ? 'Minat Properti Umum' : implode(', ', $propertyNames);

            // Note: Not assigning inquiry_id here because this could span multiple inquiries.
            // (One follow-up action might touch 2 inquiries). The table structure has nullable inquiry_id.
            CustomerActivity::create([
                'customer_id' => $client->id,
                'action_type' => 'contact',
                'description' => 'Agen mengirimkan pesan kepada pelanggan terkait: ' . $propString,
                'new_values' => ['title' => 'Follow-up awal dilakukan via WhatsApp']
            ]);

            CustomerActivity::create([
                'customer_id' => $client->id,
                'action_type' => 'status_change',
                'description' => 'Status klien berubah dari New Lead menjadi Contacted.',
                'new_values' => ['title' => 'Status Pipeline bergerak maju']
            ]);

            return true;
        });
    }
}
