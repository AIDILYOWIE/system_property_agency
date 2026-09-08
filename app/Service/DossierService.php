<?php

namespace App\Service;

use App\Models\Property;
use Illuminate\Support\Facades\Storage;

class DossierService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get safe, formatted dossier data by token.
     * 
     * @param string $token
     * @return array
     */
    public function getDossierDataByToken(string $token): array
    {
        $property = Property::with('images')->where('dossier_token', $token)->firstOrFail();

        // Data Privacy Filter: we handpick only safe fields to expose to dossier page.
        // Owner data is NEVER attached here.

        $mainImage = $property->images->where('is_main_thumbnail', true)->first();
        $galleryImages = $property->images->where('is_main_thumbnail', false)->sortBy('sort_order')->values();

        $mainImageUrl = $mainImage ? Storage::url($mainImage->image_path) : '';
        $imageUrls = [$mainImageUrl];

        foreach ($galleryImages as $img) {
            $imageUrls[] = Storage::url($img->image_path);
        }
        $imageUrls = array_values(array_filter($imageUrls)); // Ensure no empties

        $categoryMap = [
            'villas' => 'Villas',
            'premium_houses' => 'Premium Houses',
            'strategic_land' => 'Strategic Land',
            'commercial' => 'Commercial'
        ];

        return [
            'id' => $property->id,
            'title' => $property->title,
            'location' => $property->location_area,
            'description' => $property->description,
            'listingType' => $property->listing_type === 'sale' ? 'For Sale' : 'For Rent',
            'category' => $categoryMap[$property->category] ?? ucfirst(str_replace('_', ' ', $property->category)),
            'price' => (float) $property->price,
            'currency' => $property->currency,
            'landSize' => $property->land_size_sqm,
            'buildingSize' => $property->building_size_sqm,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'tenureType' => $property->tenure_type,
            'leaseholdYears' => $property->leasehold_years,
            'projectedRoi' => $property->projected_roi ? (float) $property->projected_roi : null,
            'images' => $imageUrls,
            'mainThumbnail' => $mainImageUrl
        ];
    }

    /**
     * Get default agent profile for dossier.
     * 
     * @return array
     */
    public function getAgentData(): array
    {
        return [
            // PRD model 1 is single tenant, values are predefined securely on the server
            'name' => 'Chris',
            'title' => 'Principal Agent · Chris Property Signature',
            'phone' => '628123456789',
        ];
    }
}
