import { memo, useState, type FC } from 'react';
import { Home, MapPin, Building2, Clock, ArrowRight, RefreshCw, Phone } from 'lucide-react';
import { router } from '@inertiajs/react';
import { normalizePhoneNumber } from '@/lib/whatsapp';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PropertyType = 'villa' | 'land' | 'commercial' | 'house';

export interface LeaseExpiringItem {
    id: string | number;
    name: string;
    address?: string;
    type: PropertyType;
    sellerName?: string;
    sellerPhone?: string;
    leaseEndDate: string;
    daysRemaining: number;
}

interface LeaseExpiringCardProps {
    leases: LeaseExpiringItem[];
    viewAllHref?: string;
    className?: string;
}

// ─── Icon map (mirrors PropertyListingCard pattern) ───────────────────────────

const TYPE_CONFIG: Record<PropertyType, { icon: typeof Home; bg: string; color: string }> = {
    villa: { icon: Home, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    house: { icon: Home, bg: 'bg-green-50', color: 'text-green-600' },
    land: { icon: MapPin, bg: 'bg-amber-50', color: 'text-amber-500' },
    commercial: { icon: Building2, bg: 'bg-blue-50', color: 'text-blue-500' },
};

// ─── Urgency badge ────────────────────────────────────────────────────────────

function UrgencyBadge({ days }: { days: number }) {
    const isUrgent = days <= 7;
    return (
        <span
            className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none
                ${isUrgent
                    ? 'text-red-700 bg-red-50 border border-red-700'
                    : 'text-amber-700 bg-amber-50 border border-amber-200/70'
                }`}
        >
            <Clock size={9} aria-hidden="true" />
            {days === 0 ? 'Hari ini' : `${days}d`}
        </span>
    );
}

// ─── Single list row (mirrors PropertyListingCard > ListingRow pattern) ───────

const LeaseRow: FC<{ item: LeaseExpiringItem }> = memo(({ item }) => {
    const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.house;
    const Icon = cfg.icon;
    const [isRelisting, setIsRelisting] = useState(false);

    const handleWA = () => {
        if (!item.sellerPhone) return;
        const phone = normalizePhoneNumber(item.sellerPhone);
        const seller = item.sellerName ?? 'Bapak/Ibu';
        const text = `Halo ${seller}, masa sewa ${item.name} akan berakhir pada ${item.leaseEndDate}. Apakah Bapak/Ibu ingin kami carikan penyewa baru?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleRelist = () => {
        if (isRelisting) return;
        if (!confirm('Properti akan dikembalikan ke status Available (Draft). Marketing Start Date akan di-reset. Lanjutkan?')) return;
        setIsRelisting(true);
        router.patch(
            `/inventory/${item.id}/relist`,
            {},
            { preserveScroll: true, onFinish: () => setIsRelisting(false) },
        );
    };

    return (
        // Exact same pattern as ListingRow in PropertyListingCard
        <div className="flex items-center gap-4 group cursor-pointer">
            {/* Icon container — same size/shape/pattern as ListingRow */}
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${cfg.bg} ${cfg.color}`}
                onClick={() => router.visit(`/inventory/detail/${item.id}`)}
            >
                <Icon size={18} aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className="text-sm font-semibold text-text-primary truncate transition-colors duration-150 hover:text-primary"
                    onClick={() => router.visit(`/inventory/detail/${item.id}`)}
                >
                    {item.name}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="truncate max-w-[120px]">
                        {item.sellerName ?? 'Unknown Seller'}
                    </span>
                    <span aria-hidden="true">•</span>
                    <UrgencyBadge days={item.daysRemaining} />
                    <span aria-hidden="true">•</span>
                    <span>{item.leaseEndDate}</span>
                </p>
            </div>

            {/* Actions — same container style as ListingRow "View" button */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={handleRelist}
                    disabled={isRelisting}
                    aria-label={`Re-list ${item.name}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 bg-white border border-red-700 rounded-md focus:outline-none disabled:opacity-50"
                >
                    <RefreshCw size={11} className={`stroke-[2.5] ${isRelisting ? 'animate-spin' : ''}`} />
                    Re-list
                </button>

                {item.sellerPhone && (
                    <button
                        type="button"
                        onClick={handleWA}
                        aria-label={`Hubungi seller ${item.sellerName ?? ''} via WhatsApp`}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-white border border-border-base text-text-primary rounded-md transition-colors duration-150 focus:outline-none"
                    >
                        <Phone size={11} className="stroke-[2.5]" />
                        Hubungi
                    </button>
                )}
            </div>
        </div>
    );
});
LeaseRow.displayName = 'LeaseRow';

// ─── Card (mirrors PropertyListingCard container pattern) ─────────────────────

const LeaseExpiringCard: FC<LeaseExpiringCardProps> = memo(
    ({ leases, viewAllHref = '#', className = '' }) => (
        <div className={`bg-white rounded-2xl p-6 border border-border-base flex flex-col ${className}`}>
            {/* Header — same markup as PropertyListingCard */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-text-primary">Lease Expiring Soon</h3>
                <a
                    href={viewAllHref}
                    className="text-xs border border-border-base rounded-full px-3 py-1 text-text-primary hover:bg-gray-50 flex items-center gap-1 font-medium "
                    aria-label="View all expiring leases"
                >
                    View All
                    <ArrowRight size={12} aria-hidden="true" />
                </a>
            </div>

            {/* List — same gap/structure as PropertyListingCard */}
            <div className="flex flex-col gap-4">
                {leases.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-4">No leases expiring soon.</p>
                ) : (
                    leases.map(item => <LeaseRow key={item.id} item={item} />)
                )}
            </div>
        </div>
    ),
);
LeaseExpiringCard.displayName = 'LeaseExpiringCard';

export default LeaseExpiringCard;
