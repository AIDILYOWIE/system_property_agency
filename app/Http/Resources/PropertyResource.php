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
            'id'           => $this->id,
            'title'        => $this->title,
            'location'     => $this->location_area,
            'price'        => $this->price,
            'currency'     => $this->currency,
            'category'     => $categoryMap[$this->category] ?? ucfirst(str_replace('_', ' ', $this->category)),
            'listingType'  => $listingType,
            'listing_type_raw' => $this->listing_type,
            'status'       => $this->status,
            'visibility'   => $this->visibility,
            'leads'        => $this->inquiries_count ?? 0,
            'days_on_market' => $this->days_on_market,
            'thumbnail'    => $this->cloneValueOrUrl($this->mainImage),
            'missing_publish_requirements' => $missingRequirements,
            // Exposed for Inventory card display — only present for rent listings
            'rental'       => $this->whenLoaded('rentalDetail', function () {
                return [
                    'rent_period'             => $this->rentalDetail->rent_period,
                    'rent_period_label'       => $this->rentalDetail->rent_period_label,
                    'min_lease_duration'      => $this->rentalDetail->min_lease_duration,
                    'min_lease_duration_label' => $this->rentalDetail->min_lease_duration_label,
                    'lease_end_date'          => $this->rentalDetail->lease_end_date?->format('Y-m-d'),
                    'days_until_lease_ends'   => $this->rentalDetail->days_until_lease_ends,
                ];
            }),
        ];
    }

    private function cloneValueOrUrl($mainImage)
    {
        return $mainImage ? Storage::url($mainImage->image_path) : 'https://placehold.co/150x150?text=No+Image';
    }
}
