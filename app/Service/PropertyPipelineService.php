<?php

namespace App\Service;

use App\Models\Property;

class PropertyPipelineService
{
    /**
     * Get all properties in the seller pipeline (Kanban data).
     * Only returns properties that belong to a seller (seller_id IS NOT NULL).
     *
     * @return \Illuminate\Support\Collection
     */
    public function getKanbanData()
    {
        return Property::query()
            ->whereNotNull('seller_id')
            ->whereNotNull('seller_pipeline_status')
            ->with('seller:id,name,phone')
            ->select([
                'id',
                'seller_id',
                'title',
                'category',
                'listing_type',
                'price',
                'currency',
                'location_area',
                'seller_pipeline_status',
                'seller_reason',
                'description',
                'created_at',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn(Property $p) => [
                'id'              => $p->id,
                'status'          => $p->seller_pipeline_status,
                'propertyTitle'   => $p->title,
                'category'        => $p->category,
                'listingType'     => $p->listing_type,
                'estimatedPrice'  => $p->price,
                'currency'        => $p->currency ?? 'IDR',
                'locationArea'    => $p->location_area ?? '-',
                'sellerName'      => $p->seller?->name ?? '-',
                'sellerPhone'     => $p->seller?->phone ?? '',
                'sellerId'        => $p->seller_id,
                'notes'           => $p->description,
                'sellerReason'    => $p->seller_reason,
                'createdAt'       => $p->created_at?->toISOString(),
            ]);
    }

    /**
     * Update the pipeline status of a seller's property.
     * Updates seller_pipeline_status (and optionally seller_rejection_reason).
     * If status = "listed", also publishes the property.
     *
     * @param string $id
     * @param string $status
     * @param string|null $statusReason
     * @return Property
     */
    public function updateStatus(string $id, string $status, ?string $statusReason): Property
    {
        $property = Property::whereNotNull('seller_id')->findOrFail($id);

        $updates = [
            'seller_pipeline_status' => $status,
            // Store reason for both listed (listing rationale) and rejected
            'seller_reason'          => in_array($status, ['listed', 'rejected']) ? $statusReason : null,
        ];

        // US 4.4 Rule 1: When moving to "listed", publish the property
        if ($status === 'listed') {
            $updates['visibility']   = 'published';
            $updates['published_at'] = $property->published_at ?? now();
            if (!$property->marketing_start_date) {
                $updates['marketing_start_date'] = now()->toDateString();
            }
        }

        $property->update($updates);

        return $property;
    }

    /**
     * US 4.4 Rule 3: Auto-advance status to "surveyed" when WA button is clicked.
     *
     * @param string $id
     * @return Property
     */
    public function advanceToSurveyed(string $id): Property
    {
        $property = Property::whereNotNull('seller_id')->findOrFail($id);

        if ($property->seller_pipeline_status === 'incoming') {
            $property->update(['seller_pipeline_status' => 'surveyed']);
        }

        return $property;
    }
}
