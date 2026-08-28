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
