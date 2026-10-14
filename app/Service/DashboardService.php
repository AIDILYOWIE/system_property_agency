<?php

namespace App\Service;

use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Support\Carbon;

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
     * Rental properties with status 'rented' whose lease ends within the next 30 days.
     *
     * @return array{
     *     leaseExpiringSoon: int,
     *     expiringLeasesList: array<int, array{
     *         id: string,
     *         name: string,
     *         type: string,
     *         sellerName: string,
     *         sellerPhone: string|null,
     *         leaseEndDate: string|null,
     *         daysRemaining: int
     *     }>
     * }
     */
    public function getLeaseExpiringMetrics(): array
    {
        $today = now()->toDateString();
        $in30Days = now()->addDays(30)->toDateString();

        $leaseExpiringSoon = Property::query()
            ->where('status', 'rented')
            ->whereHas('rentalDetail', function ($query) use ($today, $in30Days) {
                $query->whereNotNull('lease_end_date')
                    ->whereDate('lease_end_date', '>=', $today)
                    ->whereDate('lease_end_date', '<=', $in30Days);
            })
            ->count();

        $expiringLeases = Property::query()
            ->where('status', 'rented')
            ->join('property_rentals', 'properties.id', '=', 'property_rentals.property_id')
            ->whereNotNull('property_rentals.lease_end_date')
            ->whereDate('property_rentals.lease_end_date', '>=', $today)
            ->whereDate('property_rentals.lease_end_date', '<=', $in30Days)
            ->orderBy('property_rentals.lease_end_date', 'asc')
            ->select('properties.*')
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
     * Get Conversion Snapshot metrics (PRD Section 5 Metric 6).
     * Simple WON vs LOST ratio for inquiries closed in the last 30 days.
     *
     * Uses closed_at (not updated_at) for a reliable, immutable timestamp.
     *
     * @return array{
     *     wonCount: int,
     *     lostCount: int,
     *     totalClosed: int,
     *     conversionRate: float,   // 0-100 percentage
     *     displayLabel: string,    // e.g. "68%" or "N/A"
     * }
     */
    public function getConversionSnapshotMetrics(): array
    {
        $since = now()->subDays(30)->toDateTimeString();

        $stats = Inquiry::query()
            ->whereIn('pipeline_status', ['won', 'lost'])
            ->where('closed_at', '>=', $since)
            ->selectRaw("
                COUNT(*) as total_closed,
                COUNT(CASE WHEN pipeline_status = 'won' THEN 1 END) as won_count,
                COUNT(CASE WHEN pipeline_status = 'lost' THEN 1 END) as lost_count
            ")
            ->first();

        $totalClosed  = (int) ($stats->total_closed ?? 0);
        $wonCount     = (int) ($stats->won_count ?? 0);
        $lostCount    = (int) ($stats->lost_count ?? 0);
        $conversionRate = $totalClosed > 0
            ? round(($wonCount / $totalClosed) * 100, 1)
            : 0.0;

        return [
            'wonCount'       => $wonCount,
            'lostCount'      => $lostCount,
            'totalClosed'    => $totalClosed,
            'conversionRate' => $conversionRate,
            'displayLabel'   => $totalClosed > 0 ? $conversionRate . '%' : '0',
        ];
    }

    /**
     * Get Inventory Health metrics (PRD Section 5 Metric 5).
     *
     * A "Stale Listing" is an Available property that has been on the market
     * for more than 60 days and has received zero buyer inquiries.
     * PRD US 1.2 AC & US 1.4 Rule 2 reference the 60-day / 0-lead threshold.
     *
     * @return array{
     *     staleCount: int,
     *     staleListings: array<int, array{
     *         id: string,
     *         title: string,
     *         category: string,
     *         daysOnMarket: int,
     *         marketingStartDate: string|null
     *     }>
     * }
     */
    public function getInventoryHealthMetrics(): array
    {
        $staleCutoff = Carbon::today()->subDays(60)->toDateString();

        // Base query: Available properties on market >60 days with 0 inquiries.
        // We use doesntHave() for the zero-leads check — it emits a NOT EXISTS
        // subquery which is index-friendly and avoids a GROUP BY aggregation.
        $baseQuery = Property::query()
            ->where('status', 'available')
            ->whereNotNull('marketing_start_date')
            ->whereDate('marketing_start_date', '<=', $staleCutoff)
            ->doesntHave('inquiries');

        $staleCount = (clone $baseQuery)->count();

        // Fetch the 5 most stale listings (oldest marketing_start_date first)
        // for the dashboard detail view — to keep page weight minimal.
        $staleListings = (clone $baseQuery)
            ->orderBy('marketing_start_date', 'asc')
            ->take(5)
            ->get()
            ->map(function (Property $property) {
                return [
                    'id'                 => $property->id,
                    'title'              => $property->title,
                    'category'           => $property->category,
                    'daysOnMarket'       => $property->days_on_market,
                    'marketingStartDate' => $property->marketing_start_date
                        ? $property->marketing_start_date->format('j M Y')
                        : null,
                    'href'               => route('inventory.detail', $property->id),
                ];
            })
            ->toArray();

        return [
            'staleCount'    => $staleCount,
            'staleListings' => $staleListings,
        ];
    }

    /**
     * Aggregate all overview dashboard metrics.
     * All sub-metric methods are independent — safe for parallelisation in the future.
     */
    public function getDashboardMetrics(): array
    {
        $moneyOnTable       = $this->getMoneyOnTableMetrics();
        $leaseMetrics       = $this->getLeaseExpiringMetrics();
        $conversionSnapshot = $this->getConversionSnapshotMetrics();
        $inventoryHealth    = $this->getInventoryHealthMetrics();

        return [
            'moneyOnTable'        => $moneyOnTable,
            'leaseExpiringSoon'   => $leaseMetrics['leaseExpiringSoon'],
            'expiringLeasesList'  => $leaseMetrics['expiringLeasesList'],
            'conversionSnapshot'  => $conversionSnapshot,
            'inventoryHealth'     => $inventoryHealth,
        ];
    }
}
