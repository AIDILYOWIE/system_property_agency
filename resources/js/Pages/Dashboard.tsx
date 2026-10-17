import DashboardLayout from '@/Layouts/DashboardLayout';
import { TrendingUp, Clock, AlertTriangle, ArrowUpRight, PieChart } from 'lucide-react';
import { memo, useMemo, type FC } from 'react';
import { Link, router } from '@inertiajs/react';
import Chart from '@/Components/Chart';
import InventoryStatusChart from '@/Components/InventoryStatusChart';
import PropertyListingCard from '@/Components/PropertyListingCard';
import type { PropertyListingItem } from '@/Components/PropertyListingCard';
import LeaseExpiringCard from '@/Components/LeaseExpiringCard';
import type { LeaseExpiringItem } from '@/Components/LeaseExpiringCard';
import GroupColumnChart from '@/Components/charts/GroupColumnChart';
import type { PerformanceDataItem } from '@/Components/charts/GroupColumnChart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MoneyOnTableMetrics {
    totalValue: number;
}

export interface ConversionSnapshot {
    wonCount: number;
    lostCount: number;
    totalClosed: number;
    conversionRate: number;  // 0–100
    displayLabel: string;    // "68%" or "N/A"
}

export interface InventoryHealth {
    staleCount: number;
    staleListings: {
        id: string;
        title: string;
        category: string;
        daysOnMarket: number;
        marketingStartDate: string | null;
        href: string;
    }[];
}

export interface InventoryStatus {
    available: number;
    rented: number;
    sold: number;
    draft: number;
}

export interface DashboardMetrics {
    moneyOnTable?: MoneyOnTableMetrics;
    leaseExpiringSoon: number;
    expiringLeasesList: LeaseExpiringItem[];
    conversionSnapshot?: ConversionSnapshot;
    inventoryHealth?: InventoryHealth;
    performanceTransaction?: PerformanceDataItem[];
    newListings?: PropertyListingItem[];
    inventoryStatus?: InventoryStatus;
}

interface KPICardProps {
    title: string;
    value: number | string;
    description: string;
    icon: typeof TrendingUp;
    formatType?: 'raw' | 'number' | 'currency' | 'compact-currency';
    iconBg?: string;
    iconColor?: string;
    designVariant?: 'primary' | 'secondary';
    action?: string;
    actionHref?: string;
    badgeText?: string | number;
    badgeTooltip?: string;
    customTooltip?: string;
}

// ─── KPI Card (Bento Grid item) ───────────────────────────────────────────────

const KPICard: FC<KPICardProps> = memo(({
    title, value, description, icon: Icon,
    iconBg, iconColor, designVariant = 'secondary', action, actionHref,
    formatType = 'raw', badgeText, badgeTooltip, customTooltip
}) => {
    const isPrimary = designVariant === 'primary';

    // ─── Format Resolution ───────────────────────────────────────────────────
    const formatted = useMemo(() => {
        if (typeof value !== 'number') return { display: value, tooltip: customTooltip || String(value) };

        let displayStr = String(value);
        let tooltipStr = customTooltip || displayStr;

        if (formatType === 'currency' || formatType === 'compact-currency') {
            const fullCurrency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
            tooltipStr = customTooltip || fullCurrency;
            displayStr = formatType === 'compact-currency'
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(value)
                : fullCurrency;
        } else if (formatType === 'number') {
            displayStr = new Intl.NumberFormat('id-ID').format(value);
            tooltipStr = customTooltip || displayStr;
        }

        return { display: displayStr, tooltip: tooltipStr };
    }, [value, formatType, customTooltip]);

    // ─── Responsive Font Sizing ──────────────────────────────────────────────
    const strLen = String(formatted.display).length;
    const textSize = strLen > 12 ? 'text-2xl' : strLen > 9 ? 'text-3xl' : 'text-4xl';

    const handleCardClick = () => {
        if (actionHref) {
            router.visit(actionHref);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`card group cursor-pointer transition-all duration-300 relative overflow-hidden border
            ${isPrimary
                    ? 'bg-primary border-primary hover:shadow-lg hover:shadow-primary/20'
                    : 'bg-surface border-border-base hover:shadow-dropdown hover:border-gray-300'
                }`}
        >
            {/* Soft glow effect for primary card */}
            {isPrimary && (
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <div className="w-24 h-24 bg-white rounded-full blur-3xl"></div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${isPrimary ? 'text-white' : 'text-text-primary'}`}>{title}</p>
                </div>
                {actionHref && (
                    <Link
                        href={actionHref}
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-md p-1 transition-colors
                            ${isPrimary ? 'hover:bg-white/10 text-white hover:text-white' : 'hover:bg-gray-100 text-text-muted hover:text-text-primary'}
                        `}
                        aria-label={`Go to ${title}`}
                    >
                        <ArrowUpRight size={22} aria-hidden="true" />
                    </Link>
                )}
            </div>

            <div className="relative z-10">
                <p
                    title={formatted.tooltip}
                    data-kpi
                    className={`${textSize} font-bold tracking-tight kpi-number mb-1.5 leading-none ${isPrimary ? 'text-white' : 'text-text-primary'}`}
                >
                    {formatted.display}
                </p>

                <p className={`text-xs leading-relaxed ${isPrimary ? 'text-white/70' : 'text-text-muted'}`}>{description}</p>
            </div>
        </div>
    );
});
KPICard.displayName = 'KPICard';

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard({ metrics }: { metrics: DashboardMetrics }) {
    const moneyOnTable = useMemo(() => metrics?.moneyOnTable ?? {
        totalValue: 0,
    }, [metrics?.moneyOnTable]);

    const conversionSnapshot = useMemo(() => metrics?.conversionSnapshot ?? {
        wonCount: 0,
        lostCount: 0,
        totalClosed: 0,
        conversionRate: 0,
        displayLabel: '100',
    }, [metrics?.conversionSnapshot]);



    const kpiMetrics = {
        moneyOnTableValue: moneyOnTable.totalValue,
        leaseExpiringSoon: metrics?.leaseExpiringSoon ?? 0,
        // PRD Section 5 Metric 5: properties on market >60 days with 0 leads
        inventoryHealth: metrics?.inventoryHealth?.staleCount ?? 0,
    };

    // Conversion Snapshot tooltip: "3 WON · 1 LOST · 30 hari terakhir"
    const conversionTooltip = conversionSnapshot.totalClosed > 0
        ? `${conversionSnapshot.wonCount} WON · ${conversionSnapshot.lostCount} LOST · 30 hari terakhir`
        : 'Belum ada lead yang ditutup dalam 30 hari terakhir';

    const conversionDescription = conversionSnapshot.totalClosed > 0
        ? `${conversionSnapshot.wonCount} WON vs ${conversionSnapshot.lostCount} LOST (30 hari terakhir)`
        : 'Belum ada data (30 hari terakhir)';


    const openSlotPurchase = useMemo(() => [
        { day: 'S', leads: 20, type: 'actual' as const },
        { day: 'M', leads: 35, type: 'actual' as const },
        { day: 'T', leads: 1, type: 'actual' as const },
        { day: 'W', leads: 4, type: 'projected' as const },
        { day: 'T', leads: 5, type: 'projected' as const },
        { day: 'F', leads: 11, type: 'projected' as const },
        { day: 'S', leads: 8, type: 'projected' as const },
    ], []);

    const inventoryData = useMemo(() => ({
        rented: metrics?.inventoryStatus?.rented ?? 0,
        sold: metrics?.inventoryStatus?.sold ?? 0,
        available: metrics?.inventoryStatus?.available ?? 0,
        draft: metrics?.inventoryStatus?.draft ?? 0,
    }), [metrics?.inventoryStatus]);

    const newListings = useMemo<PropertyListingItem[]>(
        () => metrics?.newListings ?? [],
        [metrics?.newListings],
    );

    return (
        <DashboardLayout
            pageTitle="Dashboard"
            pageDescription="Actionable metrics for Chris Property Signature"
        >


            {/* ── Actionable Metrics Bento Grid ────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* 1. Money on the Table (Primary Variant) */}
                <KPICard
                    title="Money on the Table"
                    value={kpiMetrics.moneyOnTableValue}
                    formatType="compact-currency"
                    // customTooltip={moneyOnTableTooltip}
                    description={"Leads currently in Viewing or Negotiation stage"}
                    icon={TrendingUp}
                    designVariant="primary"
                    action="View Pipelines"
                    actionHref="/pipelines"
                />

                {/* 2. Lease Expiring Soon Alert */}
                <KPICard
                    title="Lease Expiring Soon"
                    value={kpiMetrics.leaseExpiringSoon}
                    description="Kontrak sewa properti akan berakhir dalam <= 30 hari"
                    icon={Clock}
                    iconBg="bg-warning/10"
                    iconColor="text-warning"
                    designVariant="secondary"
                    action="View Expiring Leases"
                    actionHref="/inventory?listingType=For+Rent&status=rented"
                />

                {/* 3. Conversion Snapshot — real WON vs LOST ratio (PRD §5 Metric 6) */}
                <KPICard
                    title="Conversion Snapshot"
                    value={conversionSnapshot.displayLabel}
                    description={conversionDescription}
                    customTooltip={conversionTooltip}
                    icon={PieChart}
                    iconBg="bg-success/10"
                    iconColor="text-success"
                    designVariant="secondary"
                    action="View CRM"
                    actionHref="/customer"
                />

                {/* 4. Inventory Health — stale listings (PRD Section 5 Metric 5) */}
                <KPICard
                    title="Inventory Health"
                    value={kpiMetrics.inventoryHealth}
                    description="Listings on market >60 days with zero leads (Stale)"
                    icon={AlertTriangle}
                    iconBg="bg-danger/10"
                    iconColor="text-danger"
                    designVariant="secondary"
                    action="Review Stale Listings"
                    actionHref={route('inventory') + '?stale=true'}
                />
            </div>

            {/* ── Analytics & Secondary Widgets ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Bar Charts — each spans 2 cols on xl */}
                <GroupColumnChart data={metrics?.performanceTransaction ?? []} />
                <Chart data={openSlotPurchase} title="Property Lead" />
            </div>

            {/* ── Inventory Status + New Listings + Lease Expiring ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <PropertyListingCard
                    className='col-span-1 md:col-span-2 xl:col-span-2'
                    listings={newListings}
                    viewAllHref="/admin/properties"
                />
                <LeaseExpiringCard
                    className='col-span-1 md:col-span-2 xl:col-span-2'
                    leases={metrics?.expiringLeasesList || []}
                    viewAllHref="/inventory?listingType=For+Rent&status=rented"
                />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6' >
                <InventoryStatusChart className='col-span-1' data={inventoryData} />

            </div>

        </DashboardLayout>
    );
}
