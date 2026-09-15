<?php

namespace App\Service;

use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

        return $query->paginate(10);
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
     * Retrieve detailed data of a single property (US 1.2)
     *
     * @param string|int $id
     * @return Property
     */
    public function getPropertyDetails($id): Property
    {
        return Property::with(['images', 'inquiries.customer', 'facilities'])->withCount('inquiries')->findOrFail($id);
    }

    /**
     * Store a new property with its images.
     *
     * @param array $data
     * @param UploadedFile $mainThumbnail
     * @param array<UploadedFile>|null $gallery
     * @return Property
     */
    public function storeProperty(array $data, ?UploadedFile $mainThumbnail, ?array $gallery = []): Property
    {
        try {
            DB::beginTransaction();


            // Generate UUID for private dossier (US 3.2 logic base)
            $data['dossier_token'] = Str::uuid()->toString();

            if (isset($data['status']) && in_array($data['status'], ['sold', 'rented'])) {
                $data['sold_at'] = now();
            }

            if (isset($data['action_type']) && $data['action_type'] === 'draft') {
                $data['visibility'] = 'draft';
                $data['published_at'] = null;
            } else {
                $data['visibility'] = 'published';
                $data['published_at'] = now();
            }

            // Assign seller specific pipeline status if seller_id is present
            if (isset($data['seller_id'])) {
                $data['seller_pipeline_status'] = isset($data['action_type']) && $data['action_type'] === 'publish'
                    ? 'listed'
                    : 'incoming';
            }

            // Create property
            $property = Property::create($data);

            if (isset($data['facilities'])) {
                $property->facilities()->sync($data['facilities']);
            }

            // Process and store main thumbnail
            if ($mainThumbnail) {
                $mainImagePath = $this->uploadAndProcessImage($mainThumbnail, 'properties/' . $property->id);
                $property->images()->create([
                    'image_path' => $mainImagePath,
                    'is_main_thumbnail' => true,
                    'sort_order' => 0
                ]);
            }

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
     * Update a property with its images.
     *
     * @param string|int $id
     * @param array $data
     * @param UploadedFile|null $mainThumbnail
     * @param array<UploadedFile>|null $gallery
     * @param array $deletedImages Paths of images to drop
     * @return Property
     */
    public function updateProperty($id, array $data, ?UploadedFile $mainThumbnail, ?array $gallery = [], array $deletedImages = []): Property
    {
        try {
            DB::beginTransaction();

            $property = Property::findOrFail($id);

            if (isset($data['category']) && $data['category'] === 'strategic_land') {
                $data['bedrooms'] = null;
                $data['bathrooms'] = null;
            }

            if (isset($data['status'])) {
                if (in_array($data['status'], ['sold', 'rented'])) {
                    $data['sold_at'] = $property->sold_at ?? now();
                } else if ($data['status'] === 'available') {
                    $data['sold_at'] = null;
                }
            }

            $property->update($data);

            if (isset($data['facilities'])) {
                $property->facilities()->sync($data['facilities']);
            }

            if ($mainThumbnail) {
                $oldMain = $property->images()->where('is_main_thumbnail', true)->first();
                if ($oldMain) {
                    Storage::disk('public')->delete($oldMain->image_path);
                    $oldMain->delete();
                }

                $mainImagePath = $this->uploadAndProcessImage($mainThumbnail, 'properties/' . $property->id);
                $property->images()->create([
                    'image_path' => $mainImagePath,
                    'is_main_thumbnail' => true,
                    'sort_order' => 0
                ]);
            }

            if (!empty($deletedImages)) {
                $imagesToDelete = $property->images()
                    ->whereIn('image_path', $deletedImages)
                    ->where('is_main_thumbnail', false) // Safety rule 3: never delete main
                    ->get();

                foreach ($imagesToDelete as $img) {
                    Storage::disk('public')->delete($img->image_path);
                    $img->delete();
                }
            }

            if (!empty($gallery)) {
                $maxSortOrder = $property->images()->max('sort_order') ?? 0;
                foreach ($gallery as $index => $image) {
                    if ($image instanceof UploadedFile) {
                        $imagePath = $this->uploadAndProcessImage($image, 'properties/' . $property->id);
                        $property->images()->create([
                            'image_path' => $imagePath,
                            'is_main_thumbnail' => false,
                            'sort_order' => $maxSortOrder + $index + 1
                        ]);
                    }
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

    /**
     * Toggle property visibility (US 1.5)
     *
     * @param string|int $id
     * @param string $visibility ('published' or 'draft')
     * @return array
     */
    public function toggleVisibility($id, string $visibility): array
    {
        $property = Property::findOrFail($id);

        if (!$property) {
            Log::error('Property not found');
            throw new Exception('Property not found');
        }

        $property->visibility = $visibility;
        $property->save();

        // Check for active leads based on pipeline_status
        $activeLeadsCount = $property->inquiries()
            ->whereIn('pipeline_status', ['viewing', 'negotiation'])
            ->count();

        return [
            'property' => $property,
            'active_leads_count' => $activeLeadsCount
        ];
    }
}
