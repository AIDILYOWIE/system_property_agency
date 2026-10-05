<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $listingType = $this->listing_type === 'sale' ? 'For Sale' : 'For Rent';

        $categoryMap = [
            'villas' => 'Villas',
            'premium_houses' => 'Premium Houses',
            'strategic_land' => 'Strategic Land',
            'commercial' => 'Commercial'
        ];

        $missingRequirements = [];
        if (! $this->mainImage) $missingRequirements[] = "Foto Properti";
        if (! $this->price || $this->price <= 0) $missingRequirements[] = "Harga";
        if (! $this->marketing_start_date) $missingRequirements[] = "Marketing Start Date";
        if (! $this->land_size_sqm || $this->land_size_sqm <= 0) $missingRequirements[] = "Luas Tanah";
        if (! $this->building_size_sqm && $this->category !== 'strategic_land') $missingRequirements[] = "Luas Bangunan";

        return [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location_area,
            'price' => $this->price,
            'currency' => $this->currency,
            'category' => $categoryMap[$this->category] ?? ucfirst(str_replace('_', ' ', $this->category)),
            'listingType' => $listingType,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'leads' => $this->inquiries_count ?? 0,
            'days_on_market' => $this->days_on_market,
            'thumbnail' => $this->cloneValueOrUrl($this->mainImage), // Safe ref to helper logic inline
            'missing_publish_requirements' => $missingRequirements,
        ];
    }

    private function cloneValueOrUrl($mainImage)
    {
        return $mainImage ? Storage::url($mainImage->image_path) : 'https://placehold.co/150x150?text=No+Image';
    }
}
