<?php

namespace App\Service;

use App\Models\Property;
use App\Models\Seller;
use Illuminate\Validation\ValidationException;

class SellerService
{
    /**
     * Create a new seller with specific business logic.
     *
     * @param array $data
     * @return Seller
     * @throws ValidationException
     */
    public function createSeller(array $data): Seller
    {
        // 1. Auto-format phone: non-digit removal, replace 08 with 628
        $cleanPhone = preg_replace('/[^0-9]/', '', $data['phone'] ?? '');
        if (str_starts_with($cleanPhone, '08')) {
            $cleanPhone = '628' . substr($cleanPhone, 2);
        }

        // 2. Re-check uniqueness after formatting
        if (Seller::where('phone', $cleanPhone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor ini sudah terdaftar.'
            ]);
        }

        $data['phone'] = $cleanPhone;

        // 3. Persist to mapping
        return Seller::create($data);
    }

    /**
     * Add a property (pra-listing) to a seller.
     * Auto-assigns seller_id, pipeline status, and validates duplicate.
     *
     * @param Seller $seller
     * @param array  $data
     * @return \App\Models\Property
     * @throws ValidationException
     */
    public function addProperty(Seller $seller, array $data): Property
    {
        // Duplicate check: same seller + same title
        $exists = $seller->properties()
            ->whereRaw('LOWER(title) = ?', [strtolower($data['title'])])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'title' => 'Properti dengan judul yang sama sudah ada untuk seller ini.'
            ]);
        }

        return $seller->properties()->create([
            'title'                   => $data['title'],
            'category'                => $data['category'],
            'listing_type'            => $data['listing_type'],
            'price'                   => $data['price'] ?? null,
            'location_area'           => $data['location_area'] ?? null,
            'description'             => $data['notes'] ?? null, // Use notes as initial description
            'seller_pipeline_status'  => 'incoming',
            'status'                  => 'available',
            'visibility'              => 'draft',
            'currency'                => 'IDR',
        ]);
    }

    /**
     * Return properties that have no seller assigned yet (seller_id IS NULL).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUnassignedProperties()
    {
        return Property::whereNull('seller_id')
            ->with('mainImage')
            ->withCount('inquiries')
            ->latest()
            ->get();
    }

    /**
     * Assign an existing (unassigned) property to a seller.
     * Sets seller_id and seller_pipeline_status = 'incoming'.
     *
     * @param Seller $seller
     * @param Property $property
     * @return Property
     */
    public function assignProperty(Seller $seller, Property $property): Property
    {
        abort_if($property->seller_id !== null, 422, 'Properti ini sudah memiliki seller.');

        $property->update([
            'seller_id'               => $seller->id,
            'seller_pipeline_status'  => 'incoming',
        ]);

        return $property;
    }
}
