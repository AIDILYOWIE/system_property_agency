<?php

namespace App\Service;

use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Exception;

class PropertyService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Retrieve paginated properties applying filters and logic (US 1.4)
     *
     * @param array $params
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAllProperties(array $params)
    {
        $query = Property::query()->with(['mainImage']);

        $this->applySearchAndFilters($query, $params);
        $this->applySorting($query, $params);

        return $query->paginate(10)->through(fn($item) => $this->formatPropertyData($item));
    }

    /**
     * Apply search query and multi-dimensional filters
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $params
     * @return void
     */
    private function applySearchAndFilters($query, array $params): void
    {
        if (!empty($params['search'])) {
            $searchTerm = '%' . $params['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ilike', $searchTerm)
                    ->orWhere('location_area', 'ilike', $searchTerm);
            });
        }

        if (!empty($params['category']) && $params['category'] !== 'All Categories') {
            $query->where('category', strtolower($params['category']));
        }

        if (!empty($params['listingType']) && $params['listingType'] !== 'All Listing Types') {
            $mappedType = $params['listingType'] === 'For Sale' ? 'sale' : 'rent';
            $query->where('listing_type', $mappedType);
        }

        if (!empty($params['status']) && $params['status'] !== 'All Status') {
            $query->where('status', strtolower($params['status']));
        }

        if (!empty($params['visibility']) && $params['visibility'] !== 'All Visibilities') {
            $query->where('visibility', strtolower($params['visibility']));
        }
    }

    /**
     * Apply sorting logic with specific business rules
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $params
     * @return void
     */
    private function applySorting($query, array $params): void
    {
        $sortBy = $params['sort'] ?? 'created_at';
        $sortDir = $params['direction'] ?? 'desc';

        if ($sortBy === 'days_on_market') {
            $query->orderBy('published_at', $sortDir === 'desc' ? 'asc' : 'desc');
        } elseif ($sortBy === 'leads') {
            $query->orderBy('inquiries_count', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        // Rule 1: Newest First is default.
        if ($sortBy === 'created_at') {
            $query->orderBy('id', 'desc'); // Fallback sequence
        }
    }

    /**
     * Format the property model instance into a client-safe DTO/Array representation.
     *
     * @param Property $item
     * @return array
     */
    private function formatPropertyData($item): array
    {
        $listingType = $item->listing_type === 'sale' ? 'For Sale' : 'For Rent';

        $categoryMap = [
            'villas' => 'Villas',
            'premium_houses' => 'Premium Houses',
            'strategic_land' => 'Strategic Land',
            'commercial' => 'Commercial'
        ];

        return [
            'id' => $item->id,
            'title' => $item->title,
            'location' => $item->location_area,
            'price' => $item->price,
            'currency' => $item->currency,
            'category' => $categoryMap[$item->category] ?? ucfirst(str_replace('_', ' ', $item->category)),
            'listingType' => $listingType,
            'status' => $item->status,
            'visibility' => $item->visibility,
            'leads' => $item->inquiries_count ?? 0,
            'days_on_market' => $item->days_on_market,
            'thumbnail' => Storage::url($item->mainImage->image_path),
        ];
    }

    /**
     * Store a new property with its images.
     *
     * @param array $data
     * @param UploadedFile $mainThumbnail
     * @param array<UploadedFile>|null $gallery
     * @return Property
     */
    public function storeProperty(array $data, UploadedFile $mainThumbnail, ?array $gallery = []): Property
    {
        try {
            DB::beginTransaction();

            // Handle defaulting business rules
            // $data['status'] = 'available';
            // $data['visibility'] = 'draft';

            // Generate UUID for private dossier (US 3.2 logic base)
            $data['dossier_token'] = \Illuminate\Support\Str::uuid()->toString();

            // Create property
            $property = Property::create($data);

            // Process and store main thumbnail
            $mainImagePath = $this->uploadAndProcessImage($mainThumbnail, 'properties/' . $property->id);
            $property->images()->create([
                'image_path' => $mainImagePath,
                'is_main_thumbnail' => true,
                'sort_order' => 0
            ]);

            // Process and store gallery images if any
            if (!empty($gallery)) {
                foreach ($gallery as $index => $image) {
                    $imagePath = $this->uploadAndProcessImage($image, 'properties/' . $property->id);
                    $property->images()->create([
                        'image_path' => $imagePath,
                        'is_main_thumbnail' => false,
                        'sort_order' => $index + 1
                    ]);
                }
            }

            DB::commit();

            return $property;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Process image upload (Storage + Pseudo Compression/Auto-Crop)
     */
    private function uploadAndProcessImage(UploadedFile $file, string $directory): string
    {
        // TODO: Implement actual image compression and crop (e.g. using Spatie Image or Intervention Image)
        // For now, we utilize the standard storage.
        return $file->store($directory, 'public');
    }
}
