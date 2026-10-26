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
                    'address'       => $property->full_address ?? $property->location_area ?? null,
                    'type'          => match ($property->category) {
                        'villas'          => 'villa',
                        'premium_houses'  => 'house',
                        'commercial'      => 'commercial',
                        'strategic_land'  => 'land',
                        default           => 'house',
                    },
                    'sellerName'    => $property->seller->name ?? 'Unknown Seller',
                    'sellerPhone'   => $property->seller->phone ?? null,
                    'leaseEndDate'  => $property->rentalDetail->lease_end_date
                        ? $property->rentalDetail->lease_end_date->format('j M Y')
                        : null,
                    'daysRemaining' => max(0, $property->rentalDetail->days_until_lease_ends ?? 0),
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
     * Get Performance Transaction metrics for the current ISO week (Mon–Sun).
     *
     * Shows daily WON vs LOST count for each day of the current week.
     * Data "resets" automatically — we always query the current week window,
     * so last week's records are excluded once a new week begins.
     *
     * Each slot in the returned array corresponds to a display day (Sun … Sat):
     *   - type 'actual'    → past days with real data
     *   - type 'today'     → today's live running total
     *   - type 'projected' → future days (won=0, lost=0, render as empty/hatched)
     *
     * @return array<int, array{label: string, won: int, lost: int, type: string}>
     */
    public function getPerformanceTransactionMetrics(): array
    {
        $today     = Carbon::now();
        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd   = $today->copy()->endOfWeek(Carbon::SUNDAY);

        // Single aggregated query — GROUP BY DOW + pipeline_status.
        // EXTRACT(DOW …) returns PostgreSQL convention: 0=Sun … 6=Sat.
        $rows = Inquiry::query()
            ->whereIn('pipeline_status', ['won', 'lost'])
            ->whereNotNull('closed_at')
            ->whereDate('closed_at', '>=', $weekStart->toDateString())
            ->whereDate('closed_at', '<=', $weekEnd->toDateString())
            ->selectRaw("EXTRACT(DOW FROM closed_at)::int AS dow,
                pipeline_status,
                COUNT(*) AS cnt
            ")
            ->groupByRaw('dow, pipeline_status')
            ->get()
            ->groupBy('dow');   // Collection keyed by integer DOW (0=Sun … 6=Sat)

        $todayDow = (int) $today->format('w'); // 0=Sun … 6=Sat

        // Chart display order: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
        $labels      = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        $displayDows = [0, 1, 2, 3, 4, 5, 6];

        $result = [];
        foreach ($displayDows as $i => $dow) {
            $dayRows = $rows->get($dow) ?? collect();

            $won  = (int) ($dayRows->firstWhere('pipeline_status', 'won')?->cnt  ?? 0);
            $lost = (int) ($dayRows->firstWhere('pipeline_status', 'lost')?->cnt ?? 0);

            // Map DOW → calendar offset from Monday (the ISO week start).
            // Sun(0) is 6 days after Mon; Mon(1)=0 … Sat(6)=5.
            $dayOffset = $dow === 0 ? 6 : $dow - 1;
            $dayDate   = $weekStart->copy()->addDays($dayOffset);

            if ($dayDate->isSameDay($today)) {
                $type = 'today';
            } elseif ($dayDate->lt($today->copy()->startOfDay())) {
                $type = 'actual';
            } else {
                $type = 'projected';
            }

            $result[] = [
                'label' => $labels[$i],
                'won'   => $won,
                'lost'  => $lost,
                'type'  => $type,
            ];
        }

        return $result;
    }

    /**
     * Get New Listings metrics.
     * Returns the 5 most recently listed/published properties,
     * ordered by marketing_start_date descending.
     *
     * @return array<int, array{
     *     id: string,
     *     name: string,
     *     location: string,
     *     type: string,
     *     daysListed: int,
     *     leads: int,
     *     href: string
     * }>
     */
    public function getNewListingsMetrics(): array
    {
        return Property::query()
            ->whereIn('status', ['available', 'rented', 'sold'])
            ->whereNotNull('marketing_start_date')
            ->withCount('inquiries')
            ->orderBy('marketing_start_date', 'desc')
            ->take(5)
            ->get()
            ->map(function (Property $property) {
                return [
                    'id'        => $property->id,
                    'name'      => $property->title,
                    'address'  => $property->full_address ?? '-',
                    'type'      => match ($property->category) {
                        'villas'          => 'villa',
                        'premium_houses'  => 'house',
                        'commercial'      => 'commercial',
                        'strategic_land'  => 'land',
                        default           => 'house',
                    },
                    'daysListed' => $property->days_on_market,
                    'leads'      => (int) ($property->inquiries_count ?? 0),
                    'href'       => route('inventory.detail', $property->id),
                ];
            })
            ->toArray();
    }

    /**
     * Get Inventory Status breakdown (rented / sold / available / draft).
     *
     * Uses a single aggregated query (GROUP BY status + visibility) to avoid
     * multiple round-trips. Draft is derived from visibility='draft' regardless
     * of status, matching the UI legend semantics.
     *
     * @return array{rented: int, sold: int, available: int, draft: int}
     */
    public function getInventoryStatusMetrics(): array
    {
        // One query: count by status for non-draft properties
        $statsCounts = Property::query()
            ->where('visibility', '!=', 'draft')
            ->selectRaw("status, COUNT(*) as cnt")
            ->groupBy('status')
            ->pluck('cnt', 'status');

        // Draft count: visibility = 'draft' (any status)
        $draftCount = Property::query()
            ->where('visibility', 'draft')
            ->count();

        return [
            'available' => (int) ($statsCounts->get('available') ?? 0),
            'rented'    => (int) ($statsCounts->get('rented')    ?? 0),
            'sold'      => (int) ($statsCounts->get('sold')      ?? 0),
            'draft'     => $draftCount,
        ];
    }

    /**
     * Get Property Lead metrics for the current ISO week (Mon–Sun).
     *
     * Counts all new inquiries (leads) created per day of the current week,
     * regardless of pipeline status. Mirrors the day-slot logic of
     * getPerformanceTransactionMetrics() so the Chart component receives
     * an identical shape: { day, leads, type }.
     *
     *   - type 'actual'    → past days with real lead counts
     *   - type 'today'     → today's running total
     *   - type 'projected' → future days (leads = 0, rendered as hatched bar)
     *
     * @return array<int, array{day: string, leads: int, type: string}>
     */
    public function getPropertyLeadMetrics(): array
    {
        $today     = Carbon::now();
        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd   = $today->copy()->endOfWeek(Carbon::SUNDAY);

        // Single aggregated query — COUNT leads grouped by day-of-week.
        // EXTRACT(DOW …) returns PostgreSQL convention: 0=Sun … 6=Sat.
        $rows = Inquiry::query()
            ->whereDate('created_at', '>=', $weekStart->toDateString())
            ->whereDate('created_at', '<=', $weekEnd->toDateString())
            ->selectRaw('EXTRACT(DOW FROM created_at)::int AS dow, COUNT(*) AS cnt')
            ->groupByRaw('dow')
            ->pluck('cnt', 'dow'); // Collection keyed by DOW integer

        // Chart display order: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
        $labels      = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        $displayDows = [0, 1, 2, 3, 4, 5, 6];

        $result = [];
        foreach ($displayDows as $i => $dow) {
            $leads = (int) ($rows->get($dow) ?? 0);

            // Map DOW → calendar date (same offset logic as PerformanceTransaction).
            // Sun(0) is 6 days after Monday; Mon(1)=+0 … Sat(6)=+5.
            $dayOffset = $dow === 0 ? 6 : $dow - 1;
            $dayDate   = $weekStart->copy()->addDays($dayOffset);

            if ($dayDate->isSameDay($today)) {
                $type = 'today';
            } elseif ($dayDate->lt($today->copy()->startOfDay())) {
                $type = 'actual';
            } else {
                $type = 'projected';
            }

            $result[] = [
                'day'   => $labels[$i],
                'leads' => $leads,
                'type'  => $type,
            ];
        }

        return $result;
    }

    /**
     * Aggregate all overview dashboard metrics.
     * All sub-metric methods are independent — safe for parallelisation in the future.
     */
    public function getDashboardMetrics(): array
    {
        $moneyOnTable            = $this->getMoneyOnTableMetrics();
        $leaseMetrics            = $this->getLeaseExpiringMetrics();
        $conversionSnapshot      = $this->getConversionSnapshotMetrics();
        $inventoryHealth         = $this->getInventoryHealthMetrics();
        $performanceTransaction  = $this->getPerformanceTransactionMetrics();
        $newListings             = $this->getNewListingsMetrics();
        $inventoryStatus         = $this->getInventoryStatusMetrics();
        $propertyLead            = $this->getPropertyLeadMetrics();

        return [
            'moneyOnTable'           => $moneyOnTable,
            'leaseExpiringSoon'      => $leaseMetrics['leaseExpiringSoon'],
            'expiringLeasesList'     => $leaseMetrics['expiringLeasesList'],
            'conversionSnapshot'     => $conversionSnapshot,
            'inventoryHealth'        => $inventoryHealth,
            'performanceTransaction' => $performanceTransaction,
            'newListings'            => $newListings,
            'inventoryStatus'        => $inventoryStatus,
            'propertyLead'           => $propertyLead,
        ];
    }
}
