import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { TrendingUp, Clock, Handshake, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { memo, useMemo, type FC } from 'react';
import Chart from '@/Components/Chart';
import InventoryStatusChart from '@/Components/InventoryStatusChart';
import PropertyListingCard from '@/Components/PropertyListingCard';
import type { PropertyListingItem } from '@/Components/PropertyListingCard';
import GroupColumnChart from '@/Components/charts/GroupColumnChart';

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── KPI Card (Bento Grid item) ───────────────────────────────────────────────

const KPICard: FC<KPICardProps> = memo(({
    title, value, description, icon: Icon,
    iconBg, iconColor, designVariant = 'secondary', action, actionHref,
    formatType = 'raw'
}) => {
    const isPrimary = designVariant === 'primary';

    // ─── Format Resolution ───────────────────────────────────────────────────
    const formatted = useMemo(() => {
        if (typeof value !== 'number') return { display: value, tooltip: String(value) };

        let displayStr = String(value);
        let tooltipStr = displayStr;

        if (formatType === 'currency' || formatType === 'compact-currency') {
            tooltipStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
            displayStr = formatType === 'compact-currency'
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(value)
                : tooltipStr;
        } else if (formatType === 'number') {
            displayStr = new Intl.NumberFormat('id-ID').format(value);
            tooltipStr = displayStr;
        }

        return { display: displayStr, tooltip: tooltipStr };
    }, [value, formatType]);

    // ─── Responsive Font Sizing ──────────────────────────────────────────────
    const strLen = String(formatted.display).length;
    const textSize = strLen > 12 ? 'text-2xl' : strLen > 9 ? 'text-3xl' : 'text-4xl';

    return (
        <div className={`card group cursor-pointer transition-all duration-300 relative overflow-hidden border
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

            <div className="flex items-center justify-between mb-5 relative z-10">
                <p className={`text-sm font-semibold mb-1 ${isPrimary ? 'text-white/90' : 'text-text-primary'}`}>{title}</p>
                {actionHref && (
                    <a
                        href={actionHref}
                        className={`rounded-md
                            ${isPrimary ? 'hover:bg-white/10 text-white hover:text-white' : 'hover:bg-gray-100 text-text-muted hover:text-text-primary'}
                        `}
                        aria-label={`Go to ${title}`}
                    >
                        <ArrowUpRight size={28} aria-hidden="true" />
                    </a>
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

export default function Dashboard() {
    // TODO: replace with real props from Inertia controller
    const metrics = {
        moneyOnTable: 40,
        recurringRevenue: 3,
        brandGatekeeper: 8,
        inventoryHealth: 2,
    };

    const websiteLeadsData = useMemo(() => [
        { day: 'S', leads: 4, type: 'actual' as const },
        { day: 'M', leads: 9, type: 'actual' as const },
        { day: 'T', leads: 12, type: 'today' as const },
        { day: 'W', leads: 10, type: 'projected' as const },
        { day: 'T', leads: 7, type: 'projected' as const },
        { day: 'F', leads: 4, type: 'projected' as const },
        { day: 'S', leads: 8, type: 'projected' as const },
    ], []);

    const openSlotPurchase = useMemo(() => [
        { day: 'S', leads: 20, type: 'actual' as const },
        { day: 'M', leads: 35, type: 'actual' as const },
        { day: 'T', leads: 1, type: 'actual' as const },
        { day: 'W', leads: 4, type: 'projected' as const },
        { day: 'T', leads: 5, type: 'projected' as const },
        { day: 'F', leads: 11, type: 'projected' as const },
        { day: 'S', leads: 8, type: 'projected' as const },
    ], []);

    // TODO: replace with real props from Inertia controller
    const inventoryData = {
        rented: 10,
        sold: 20,
        available: 80,
        draft: 20,
    };

    // TODO: replace with real props from Inertia controller
    const newListings = useMemo<PropertyListingItem[]>(() => [
        { id: 1, name: 'Beachfront Villa Seminyak', location: 'Seminyak, Bali', type: 'villa', daysListed: 1, leads: 0, href: '/admin/properties/1' },
        { id: 2, name: 'Strategic Land Canggu', location: 'Canggu, Bali', type: 'land', daysListed: 3, leads: 2, href: '/admin/properties/2' },
        { id: 3, name: 'Boutique Commercial Ubud', location: 'Ubud, Bali', type: 'commercial', daysListed: 5, leads: 1, href: '/admin/properties/3' },
        { id: 4, name: 'Boutique Commercial Ubud', location: 'Ubud, Bali', type: 'commercial', daysListed: 5, leads: 1, href: '/admin/properties/3' },
        { id: 5, name: 'Boutique Commercial Ubud', location: 'Ubud, Bali', type: 'commercial', daysListed: 5, leads: 1, href: '/admin/properties/3' },
    ], []);

    return (
        <DashboardLayout
            pageTitle="Dashboard"
            pageDescription="Actionable metrics for Chris Property Signature"
            badgeOverrides={{
                'crm-buyers': metrics.moneyOnTable,
                'crm-partners': metrics.brandGatekeeper,
            }}
        >


            {/* ── Actionable Metrics Bento Grid ────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* 1. Money on the Table (Primary Variant) */}
                <KPICard
                    title="Money on the Table"
                    value={metrics.moneyOnTable}
                    description="Leads currently in Viewing or Negotiation stage"
                    icon={TrendingUp}
                    designVariant="primary"
                    action="View Buyer Pipeline"
                    actionHref="/admin/crm/buyers"
                />

                {/* 2. Recurring Revenue Alert */}
                <KPICard
                    title="Recurring Revenue"
                    value={metrics.recurringRevenue}
                    description="Open Slot listings expiring within 7 days"
                    icon={Clock}
                    iconBg="bg-warning/10"
                    iconColor="text-warning"
                    designVariant="secondary"
                    action="View Expiring Listings"
                    actionHref="/admin/properties?filter=expiring"
                />

                {/* 3. Brand Gatekeeper */}
                <KPICard
                    title="Brand Gatekeeper"
                    value={metrics.brandGatekeeper}
                    description="Pending collaboration / Open Slot partnership requests"
                    icon={Handshake}
                    iconBg="bg-info/10"
                    iconColor="text-info"
                    designVariant="secondary"
                    action="View Partner Pipeline"
                    actionHref="/admin/crm/partners"
                />

                {/* 4. Inventory Health */}
                <KPICard
                    title="Inventory Health"
                    value={metrics.inventoryHealth}
                    description="Listings on market >60 days with zero leads (Stale)"
                    icon={AlertTriangle}
                    iconBg="bg-danger/10"
                    iconColor="text-danger"
                    designVariant="secondary"
                    action="Review Stale Listings"
                    actionHref="/admin/properties?filter=stale"
                />
            </div>

            {/* ── Analytics & Secondary Widgets ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Bar Charts — each spans 2 cols on xl */}
                <GroupColumnChart />
                <Chart data={openSlotPurchase} title="Open Slot Purchase" />
            </div>

            {/* ── Inventory Status + New Listings ──────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <InventoryStatusChart  className='col-span-1' data={inventoryData} />
                <PropertyListingCard
                className='col-span-2'
                    listings={newListings}
                    viewAllHref="/admin/properties"
                />
            </div>

        </DashboardLayout>
    );
}
