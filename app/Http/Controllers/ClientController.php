<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
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
        return Inertia::render('Customer/Customer');
    }

    public function create()
    {
        $properties = Property::with('mainImage')->where('status', 'available')->get()->map(function ($prop) {
            return [
                'id' => $prop->id,
                'title' => $prop->title,
                'price' => (float)$prop->price,
                'currency' => $prop->currency,
                'listingType' => $prop->listing_type === 'sale' ? 'For Sale' : 'For Rent',
                'thumbnail' => Storage::url($prop->mainImage->image_path)
            ];
        });
        return Inertia::render('Customer/AddCustomer', ['properties' => $properties]);
    }

    public function show($id)
    {
        return Inertia::render('Customer/DetailCustomer', ['id' => $id]);
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
}
