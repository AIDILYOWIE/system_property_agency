<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Service\PropertyService;
use Inertia\Inertia;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyResource;
use Exception;
use Illuminate\Support\Facades\Log;

class PropertyController extends Controller
{
    protected PropertyService $propertyService;

    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    public function index(Request $request)
    {
        $properties = $this->propertyService->getAllProperties($request->all());

        return Inertia::render('Inventory/Inventory', [
            'properties' => $properties->through(fn($item) => (new PropertyResource($item))->resolve()),
            'filters' => $request->only(['search', 'category', 'listingType', 'status', 'visibility', 'sort', 'direction'])
        ]);
    }

    /**
     * Display the specified property detail.
     * US 1.2 View & Detail Control Center
     */
    public function show(string $id)
    {
        $property = $this->propertyService->getPropertyDetails($id);

        return Inertia::render('Inventory/DetailInventory', [
            'property' => (new PropertyDetailResource($property))->resolve()
        ]);
    }

    /**
     * Store a newly created property in storage.
     * US 1.1 Create Property
     */
    public function store(StorePropertyRequest $request)
    {
        try {
            $data = $request->validated();

            $mainThumbnail = $request->file('main_thumbnail');
            $gallery = $request->file('gallery', []);

            $property = $this->propertyService->storeProperty($data, $mainThumbnail, $gallery);

            return redirect()->route('inventory')->with('success', 'Property "' . $property->title . '" created successfully.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->back()->with('error', 'Failed to create property: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified property.
     */
    public function edit(string $id)
    {
        $property = $this->propertyService->getPropertyDetails($id);

        return Inertia::render('Inventory/EditInventory', [
            'property' => (new PropertyDetailResource($property))->resolve()
        ]);
    }

    /**
     * Update the specified property in storage.
     * US 1.3 Edit Property
     */
    public function update(UpdatePropertyRequest $request, string $id)
    {
        try {
            $data = $request->validated();

            $mainThumbnail = $request->file('main_thumbnail');
            $gallery = $request->file('gallery', []);
            $deletedImages = $request->input('deleted_images', []);

            $property = $this->propertyService->updateProperty($id, $data, $mainThumbnail, $gallery, $deletedImages);

            return redirect()->route('inventory.detail', $property->id)->with('success', 'Property "' . $property->title . '" updated successfully.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->back()->with('error', 'Failed to update property: ' . $e->getMessage());
        }
    }

    /**
     * Toggle the visibility (published/draft) of a property.
     * US 1.5 Toggle Invisibility
     */
    public function toggleVisibility(Request $request, string $id)
    {

        try {
            $request->validate([
                'visibility' => 'required|in:published,draft',
            ]);

            $result = $this->propertyService->toggleVisibility($id, $request->visibility);

            $message = "Properti berhasil diubah menjadi {$request->visibility}.";

            if ($request->visibility === 'draft' && $result['active_leads_count'] > 0) {
                $message = "Properti disembunyikan. Properti ini memiliki {$result['active_leads_count']} prospek aktif (Viewing/Negotiation). Data prospek tidak akan terhapus dari CRM.";
            }

            return redirect()->back()->with('success', $message);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return redirect()->back()->with('Terjadi Kesalahan', 'Gagal mengubah status visibilitas properti.');
        }
    }
}
