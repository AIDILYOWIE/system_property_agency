<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Client;
use App\Models\Inquiry;
use App\Service\ClientService;
use App\Models\Property;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $customers = Client::with(['inquiries.property'])->orderBy('last_active_at', 'desc')->get()->map(function ($client) {
            $primaryInquiry = $client->inquiries->first();
            $property = $primaryInquiry ? $primaryInquiry->property : null;

            return [
                'id' => $client->id,
                'name' => $client->full_name,
                'phone' => $client->phone,
                'email' => $client->email,
                'customer_type' => $property ? ($property->listing_type === 'sale' ? 'buyer' : 'renter') : 'buyer',
                'pipeline_status' => $primaryInquiry ? $primaryInquiry->pipeline_status : 'new_lead',
                'interested_property' => $property ? $property->title : null,
                'source' => $client->source,
                'notes' => $client->notes,
                'created_at' => $client->created_at->toIso8601String(),
                'last_contacted' => $client->last_active_at ? $client->last_active_at->toIso8601String() : null,
            ];
        });

        return Inertia::render('Customer/Customer', ['customers' => $customers]);
    }

    public function create(ClientService $service)
    {
        $properties = $service->getAvailableProperties();
        return Inertia::render('Customer/AddCustomer', ['properties' => $properties]);
    }

    public function show($id, ClientService $service)
    {
        $customer = $service->getCustomerDetail($id);
        $properties = $service->getAvailableProperties();

        return Inertia::render('Customer/DetailCustomer', [
            'customer' => $customer,
            'properties' => $properties
        ]);
    }

    public function edit($id, ClientService $service)
    {
        $customer = $service->getCustomerDetail($id);
        $properties = $service->getAvailableProperties();

        return Inertia::render('Customer/EditCustomer', [
            'customer' => $customer,
            'properties' => $properties
        ]);
    }

    public function update(UpdateClientRequest $request, $id, ClientService $service)
    {
        try {
            $service->updateCustomer($id, $request->validated());
            return redirect()->route('customer.detail', $id)->with('success', 'Customer berhasil diperbarui!');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function store(StoreClientRequest $request, ClientService $service)
    {
        try {
            $service->storeManualLead($request->validated());
            return redirect()->route('customer')->with('success', 'Customer berhasil ditambahkan!');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updateNotes(Request $request, $id, ClientService $service)
    {
        $request->validate([
            'notes' => 'nullable|string'
        ]);

        try {
            $service->updateCustomerNotes($id, $request->notes);
            return redirect()->back()->with('success', 'Catatan berhasil diperbarui.');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui catatan: ' . $e->getMessage()]);
        }
    }

    public function followUp(Request $request, $id, ClientService $service)
    {
        $request->validate(['property_ids' => 'nullable|array']);
        $service->followUpCustomer($id, $request->property_ids ?? []);
        return redirect()->back()->with('success', 'Status pipeline diperbarui ke contacted!');
    }

    public function trackEmailFollowUp($inquiryId, ClientService $service)
    {
        $inquiry = Inquiry::with(['customer', 'property'])->findOrFail($inquiryId);

        if ($inquiry->pipeline_status === 'new_lead') {
            $service->followUpCustomer($inquiry->customer_id, [$inquiry->property_id]);
        }

        $phone = preg_replace('/[^0-9]/', '', $inquiry->customer->phone);
        if (str_starts_with($phone, '08')) {
            $phone = '628' . substr($phone, 2);
        } elseif (str_starts_with($phone, '8')) {
            $phone = '628' . substr($phone, 1);
        }
        if (!str_starts_with($phone, '628')) {
            $phone = $phone; // Fallback
        }

        $agent = "Chris Property Signature";
        $clientName = $inquiry->customer->full_name;

        if ($inquiry->property) {
            $msg = "Halo {$clientName}, saya {$agent}. Terima kasih atas ketertarikan Anda pada {$inquiry->property->title}. Apakah ada waktu untuk berdiskusi lebih lanjut?";
        } else {
            $msg = "Halo {$clientName}, saya {$agent}. Apakah ada waktu untuk berdiskusi lebih lanjut mengenai kebutuhan properti Anda?";
        }

        $url = "https://wa.me/{$phone}?text=" . urlencode($msg);

        return redirect()->away($url);
    }
}
