<?php

namespace App\Service;

use App\Models\Inquiry;
use App\Models\CustomerActivity;
use App\Service\PropertyService;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Validation\ValidationException;

class BuyerPipelineService
{
    public function __construct(private PropertyService $propertyService) {}

    /**
     * Get all active pipeline leads formatted for the Kanban board.
     */
    public function getLeads(): array
    {
        $inquiries = Inquiry::with(['customer', 'property'])->get();

        $leads = $inquiries->map(function ($inq) {
            $prop = $inq->property;
            $cust = $inq->customer;
            if (!$prop || !$cust) return null;

            return [
                'id' => (string) $inq->id,
                'customerId' => (string) $cust->id,
                'name' => $cust->full_name,
                'phone' => $cust->phone,
                'email' => $cust->email,
                'propertyName' => $prop->title,
                'fullAddress' => $prop->full_address ?? '',
                'propertyPrice' => (float) $prop->price,
                'propertyCurrency' => $prop->currency,
                'listingType'      => $prop->listing_type,
                'status'           => $inq->pipeline_status,
                'customerType' => $prop->listing_type === 'sale' ? 'buyer' : 'renter',
                'source' => ucwords(str_replace('-', ' ', $cust->source ?? 'Manual')),
                'createdAt' => $inq->created_at->toIso8601String(),
                'lastContacted' => $cust->last_active_at ? $cust->last_active_at->toIso8601String() : null,
            ];
        })->filter()->values()->toArray();

        return $leads;
    }

    /**
     * Update the pipeline status of a specific inquiry lead.
     */
    public function updateLeadStatus(string $inquiryId, string $newStatus, ?string $statusReason = null): void
    {
        DB::transaction(function () use ($inquiryId, $newStatus, $statusReason) {
            $inquiry = Inquiry::findOrFail($inquiryId);
            $oldStatus = $inquiry->pipeline_status;

            if (in_array($oldStatus, ['won', 'lost'])) {
                throw ValidationException::withMessages([
                    'status' => 'Status prospek yang sudah WON atau LOST tidak dapat diubah lagi.'
                ]);
            }

            if ($oldStatus !== $newStatus) {
                $statusUpdateArray = ['pipeline_status' => $newStatus];

                if (in_array($newStatus, ['won', 'lost'])) {
                    $statusUpdateArray['status_reason'] = $statusReason;
                } else {
                    $statusUpdateArray['status_reason'] = null; // Clear if moved out
                }

                $inquiry->update($statusUpdateArray);

                // SYNC RULE: If inquiry is closed as WON, freeze the property listing.
                if ($newStatus === 'won' && $inquiry->property) {
                    $property = $inquiry->property;
                    if ($property->status === 'available') {
                        if ($property->listing_type === 'rent') {
                            // Use service so lease_end_date is calculated & DOM is frozen properly
                            $this->propertyService->markAsRented($property->load('rentalDetail'), now()->toDateString());
                        } else {
                            $property->update([
                                'status'  => 'sold',
                                'sold_at' => now(),
                            ]);
                        }

                        // PRD US 1.6 Rule 1: auto-LOST rival inquiries for same property
                        Inquiry::where('property_id', $property->id)
                            ->where('id', '!=', $inquiry->id)
                            ->whereNotIn('pipeline_status', ['won', 'lost'])
                            ->update([
                                'pipeline_status' => 'lost',
                                'status_reason'   => 'Properti telah ' . ($property->listing_type === 'rent' ? 'tersewa' : 'terjual') . ' kepada penyewa/pembeli lain.',
                            ]);
                    }
                }

                $desc = "Status prospek untuk properti {$inquiry->property->title} diubah dari " . strtoupper($oldStatus) . " menjadi " . strtoupper($newStatus) . " via Kanban.";
                if (in_array($newStatus, ['won', 'lost']) && $statusReason) {
                    $desc .= " Alasan: " . $statusReason;
                }

                CustomerActivity::create([
                    'customer_id' => $inquiry->customer_id,
                    'action_type' => 'status_change',
                    'description' => $desc,
                    'new_values' => ['title' => 'Pembaruan Pipeline Prospek']
                ]);
            }
        });
    }
}
