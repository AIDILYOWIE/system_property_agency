<?php

namespace App\Service;

use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyRental;

class DashboardService
{
    /**
     * Get "Money on the Table" metrics.
     * PRD Section 5 Metric 1 & US 2.2 Rule 4:
     * Leads currently in Viewing or Negotiation status with their estimated property values.
     *
     * @return array{
     *     totalLeads: int,
     *     totalValue: float,
     *     viewingLeads: int,
     *     viewingValue: float,
     *     negotiationLeads: int,
     *     negotiationValue: float
     * }
     */
    public function getMoneyOnTableMetrics(): array
    {
        $stats = Inquiry::query()
            ->whereIn('inquiries.pipeline_status', ['viewing', 'negotiation'])
            ->leftJoin('properties', 'inquiries.property_id', '=', 'properties.id')
            ->selectRaw("
                COUNT(*) as total_leads,
                COALESCE(SUM(properties.price), 0) as total_value,
                COUNT(CASE WHEN inquiries.pipeline_status = 'viewing' THEN 1 END) as viewing_leads,
                COALESCE(SUM(CASE WHEN inquiries.pipeline_status = 'viewing' THEN properties.price ELSE 0 END), 0) as viewing_value,
                COUNT(CASE WHEN inquiries.pipeline_status = 'negotiation' THEN 1 END) as negotiation_leads,
                COALESCE(SUM(CASE WHEN inquiries.pipeline_status = 'negotiation' THEN properties.price ELSE 0 END), 0) as negotiation_value
            ")
            ->first();

        return [
            'totalLeads'        => (int) ($stats->total_leads ?? 0),
            'totalValue'        => (float) ($stats->total_value ?? 0),
            'viewingLeads'      => (int) ($stats->viewing_leads ?? 0),
            'viewingValue'      => (float) ($stats->viewing_value ?? 0),
            'negotiationLeads'  => (int) ($stats->negotiation_leads ?? 0),
            'negotiationValue'  => (float) ($stats->negotiation_value ?? 0),
        ];
    }

    /**
     * Get expiring lease metrics (PRD Section 5 Metric 4).
     */
    public function getLeaseExpiringMetrics(): array
    {
        $leaseExpiringSoon = PropertyRental::query()
            ->whereNotNull('lease_end_date')
            ->whereDate('lease_end_date', '>=', now()->toDateString())
            ->whereDate('lease_end_date', '<=', now()->addDays(45)->toDateString())
            ->count();

        $expiringLeases = Property::query()
            ->where('status', 'rented')
            ->whereHas('rentalDetail', function ($query) {
                $query->whereNotNull('lease_end_date')
                    ->whereDate('lease_end_date', '>=', now()->toDateString())
                    ->whereDate('lease_end_date', '<=', now()->addDays(45)->toDateString());
            })
            ->with(['rentalDetail', 'seller'])
            ->take(5)
            ->get()
            ->map(function ($property) {
                return [
                    'id'            => $property->id,
                    'name'          => $property->title,
                    'type'          => match ($property->category) {
                        'villas'          => 'villa',
                        'premium_houses'  => 'house',
                        'commercial'      => 'commercial',
                        'strategic_land'  => 'land',
                        default           => 'house',
                    },
                    'sellerName'    => $property->seller->name ?? 'Unknown Seller',
                    'sellerPhone'   => $property->seller->phone ?? null,
                    'leaseEndDate'  => $property->rentalDetail->lease_end_date ? $property->rentalDetail->lease_end_date->format('j M Y') : null,
                    'daysRemaining' => max(0, $property->rentalDetail->days_until_lease_ends),
                ];
            })
            ->toArray();

        return [
            'leaseExpiringSoon'  => $leaseExpiringSoon,
            'expiringLeasesList' => $expiringLeases,
        ];
    }

    /**
     * Aggregate all overview dashboard metrics.
     */
    public function getDashboardMetrics(): array
    {
        $moneyOnTable = $this->getMoneyOnTableMetrics();
        $leaseMetrics = $this->getLeaseExpiringMetrics();

        return [
            'moneyOnTable'       => $moneyOnTable,
            'leaseExpiringSoon'  => $leaseMetrics['leaseExpiringSoon'],
            'expiringLeasesList' => $leaseMetrics['expiringLeasesList'],
        ];
    }
}
