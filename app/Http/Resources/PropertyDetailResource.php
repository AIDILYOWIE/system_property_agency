<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $categoryMap = [
            'villas' => 'Villas',
            'premium_houses' => 'Premium Houses',
            'strategic_land' => 'Strategic Land',
            'commercial' => 'Commercial'
        ];

        // Format images
        $mainImage = $this->images->where('is_main_thumbnail', true)->first();
        $galleryImages = $this->images->where('is_main_thumbnail', false)->sortBy('sort_order')->values();

        $mainImageUrl = Storage::url($mainImage->image_path);

        $imageUrls = [$mainImageUrl];
        foreach ($galleryImages as $img) {
            $imageUrls[] = Storage::url($img->image_path);
        }


        $formattedPrice = number_format($this->price, 0, ',', '.');
        $priceString = $this->currency === 'USD' ? '$' . $formattedPrice : 'IDR ' . $formattedPrice;

        $leadsCount = $this->inquiries_count ?? 0;
        $isNormal = !($this->days_on_market >= 30 && $leadsCount === 0);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location_area,
            'price_string' => $priceString,
            'category' => $categoryMap[$this->category] ?? ucfirst(str_replace('_', ' ', $this->category)),
            'listingType' => $this->listing_type === 'sale' ? 'For Sale' : 'For Rent',
            'status' => $this->status,
            'visibility' => $this->visibility,
            'normal' => [
                'leads' => $leadsCount,
                'days_on_market' => $this->days_on_market,
                'is_normal' => $isNormal
            ],
            'added_date' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'added_date_human' => $this->created_at ? $this->created_at->diffForHumans() : '',
            'views' => 42,
            'images' => $imageUrls,
            'description' => $this->description ?? 'No description provided.',
            'specification' => [
                'bedrooms' => $this->bedrooms ?? 0,
                'bathrooms' => $this->bathrooms ?? 0,
                'land_size' => $this->land_size_sqm ?? 0,
                'building_size' => $this->building_size_sqm ?? 0,
            ],
            'dossier' => [
                'tenure' => $this->tenure_type === 'leasehold' ? 'Leasehold (' . $this->leasehold_years . ' Years)' : 'Freehold',
                'roi' => $this->projected_roi ? $this->projected_roi . '% / Year' : 'N/A',
                'zoning' => 'Yellow (Residential)',
            ]
        ];
    }
}
