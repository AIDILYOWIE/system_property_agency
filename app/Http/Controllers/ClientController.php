<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Models\Client;
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

    public function edit($id)
    {
        return Inertia::render('Customer/EditCustomer', ['id' => $id]);
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
}
