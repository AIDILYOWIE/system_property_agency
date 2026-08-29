<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use App\Service\PropertyService;
use Faker\Core\Uuid;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyResource;

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
            return redirect()->back()->with('error', 'Failed to create property: ' . $e->getMessage());
        }
    }
}
