<?php

namespace App\Http\Controllers;

use App\Http\Requests\SellerPropertyRequest;
use App\Http\Requests\SellerRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Seller;
use App\Service\SellerService;

class SellerController extends Controller
{
    protected SellerService $sellerService;

    public function __construct(SellerService $sellerService)
    {
        $this->sellerService = $sellerService;
    }

    public function index()
    {
        $sellers = Seller::latest()->get();

        return Inertia::render('Seller/Seller', [
            'sellers' => $sellers
        ]);
    }

    public function create()
    {
        return Inertia::render('Seller/AddSeller');
    }

    public function store(SellerRequest $request)
    {
        // 1. HTTP Validation (Handled by SellerRequest)
        $validated = $request->validated();

        // 2. Delegate to Service Layer
        $seller = $this->sellerService->createSeller($validated);

        // 3. Output / Response
        return redirect()->route('seller.show', $seller->id)
            ->with('success', 'Seller berhasil ditambahkan. Tambahkan properti pertama?');
    }

    // Placeholder for US 4.3 (Seller Detail) — loads seller + their properties
    public function show(Seller $seller)
    {
        $seller->load(['properties.images' => function ($query) {
            $query->where('is_main_thumbnail', true);
        }]);

        return Inertia::render('Seller/DetailSeller', [
            'seller'     => $seller,
            'properties' => $seller->properties,
        ]);
    }

    /**
     * Return properties that have no seller assigned yet (seller_id IS NULL).
     * Used by the "Assign Property" picker modal in Seller Detail page.
     */
    public function unassignedProperties()
    {
        $properties = $this->sellerService->getUnassignedProperties();

        return response()->json(
            $properties->map(fn($p) => (new PropertyResource($p))->resolve())
        );
    }

    /**
     * Assign an existing (unassigned) property to a seller.
     * Sets seller_id and seller_pipeline_status = 'incoming'.
     */
    public function assignProperty(Seller $seller, Property $property)
    {
        $this->sellerService->assignProperty($seller, $property);

        return redirect()->route('seller.show', $seller->id)
            ->with('success', 'Properti berhasil ditautkan ke seller.');
    }

    /**
     * US 4.2 — Store a new pra-listing property for a seller via modal.
     * Seller ID is auto-assigned from context — not chosen by the user.
     */
    public function storeProperty(SellerPropertyRequest $request, Seller $seller)
    {
        $validated  = $request->validated();
        $this->sellerService->addProperty($seller, $validated);

        return redirect()->route('seller.show', $seller->id)
            ->with('success', 'Properti berhasil ditambahkan ke pipeline.');
    }
}
