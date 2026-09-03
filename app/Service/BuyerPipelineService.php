<?php

namespace App\Service;

use App\Models\Inquiry;
use App\Models\CustomerActivity;
use Illuminate\Support\Facades\DB;
use Exception;

class BuyerPipelineService
{
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
                'propertyLocation' => $prop->location_area,
                'propertyPrice' => (float) $prop->price,
                'propertyCurrency' => $prop->currency,
                'status' => $inq->pipeline_status,
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
    public function updateLeadStatus(string $inquiryId, string $newStatus): void
    {
        DB::transaction(function () use ($inquiryId, $newStatus) {
            $inquiry = Inquiry::findOrFail($inquiryId);
            $oldStatus = $inquiry->pipeline_status;

            if ($oldStatus !== $newStatus) {
                $inquiry->update(['pipeline_status' => $newStatus]);

                CustomerActivity::create([
                    'customer_id' => $inquiry->customer_id,
                    'action_type' => 'status_change',
                    'description' => "Status prospek untuk properti {$inquiry->property->title} diubah dari " . strtoupper($oldStatus) . " menjadi " . strtoupper($newStatus) . " via Kanban.",
                    'new_values' => ['title' => 'Pembaruan Pipeline Prospek']
                ]);
            }
        });
    }
}
