import { memo, type FC } from 'react';
import { Home, MapPin, Building2, Clock, ArrowRight, MessageCircle, RefreshCw } from 'lucide-react';
import { router } from '@inertiajs/react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PropertyType = 'villa' | 'land' | 'commercial' | 'house';

export interface LeaseExpiringItem {
    id: string | number;
    name: string;
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

// ─── Icon map ─────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<PropertyType, { icon: typeof Home; bg: string; color: string }> = {
    villa: { icon: Home, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    house: { icon: Home, bg: 'bg-green-50', color: 'text-green-600' },
    land: { icon: MapPin, bg: 'bg-amber-50', color: 'text-amber-500' },
    commercial: { icon: Building2, bg: 'bg-blue-50', color: 'text-blue-500' },
};

// ─── Single list item ─────────────────────────────────────────────────────────

const LeaseRow: FC<{ item: LeaseExpiringItem }> = memo(({ item }) => {
    const cfg = TYPE_CONFIG[item.type];
    const Icon = cfg.icon;

    const handleWA = () => {
        if (!item.sellerPhone) return alert("Nomor WA tidak tersedia untuk seller ini.");
        const text = `Halo ${item.sellerName}, masa sewa ${item.name} akan berakhir pada ${item.leaseEndDate}. Apakah Bapak/Ibu ingin kami carikan penyewa baru?`;
        const url = `https://wa.me/${item.sellerPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleRelist = () => {
        if (confirm("Properti akan dikembalikan ke status Available (Draft). Marketing Start Date akan di-reset. Lanjutkan?")) {
            router.patch(`/inventory/${item.id}/relist`, {}, { preserveScroll: true });
        }
    };

    return (
        <div className="flex items-center gap-4 group">
            <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-colors duration-200 ${cfg.bg} ${cfg.color}`}>
                <Icon size={18} aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate transition-colors duration-150 cursor-pointer hover:text-primary" onClick={() => router.visit(`/inventory/detail/${item.id}`)}>
                    {item.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-text-muted mt-0.5">
                    <span className="font-medium">👤 {item.sellerName || 'Unknown Seller'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Clock size={10} />
                        {item.daysRemaining} days left ({item.leaseEndDate})
                    </span>
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={handleRelist}
                    className="p-2 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    title="Re-list Property"
                >
                    <RefreshCw size={14} className="stroke-[2.5]" />
                </button>
                <button
                    type="button"
                    onClick={handleWA}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/30 shadow-sm"
                >
                    <MessageCircle size={12} className="stroke-[2.5]" />
                    Hubungi
                </button>
            </div>
        </div>
    );
});
LeaseRow.displayName = 'LeaseRow';

// ─── Card ─────────────────────────────────────────────────────────────────────

const LeaseExpiringCard: FC<LeaseExpiringCardProps> = memo(
    ({ leases, viewAllHref = '#', className = '' }) => (
        <div className={`bg-white rounded-2xl p-6 border border-border-base flex flex-col ${className}`}>
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-text-primary">Lease Expiring Soon</h3>
                <a
                    href={viewAllHref}
                    className="text-xs border border-border-base rounded-full px-3 py-1 text-text-primary hover:bg-gray-50 flex items-center gap-1 font-medium transition-colors duration-150"
                    aria-label="View all expiring leases"
                >
                    View All
                    <ArrowRight size={12} aria-hidden="true" />
                </a>
            </div>

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
