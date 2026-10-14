import { memo, useState, type FC } from 'react';
import { Home, MapPin, Building2, Clock, ArrowRight, RefreshCw, Phone } from 'lucide-react';
import { router } from '@inertiajs/react';
import { normalizePhoneNumber } from '@/lib/whatsapp';

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
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.house;
    const Icon = cfg.icon;
    const [isRelisting, setIsRelisting] = useState(false);

    const handleWA = () => {
        if (!item.sellerPhone) {
            alert("Nomor WhatsApp tidak tersedia untuk seller ini.");
            return;
        }
        const phone = normalizePhoneNumber(item.sellerPhone);
        const sellerName = item.sellerName || 'Bapak/Ibu';
        const text = `Halo ${sellerName}, masa sewa ${item.name} akan berakhir pada ${item.leaseEndDate}. Apakah Bapak/Ibu ingin kami carikan penyewa baru?`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleRelist = () => {
        if (isRelisting) return;
        if (confirm("Properti akan dikembalikan ke status Available (Draft). Marketing Start Date akan di-reset. Lanjutkan?")) {
            setIsRelisting(true);
            router.patch(
                `/inventory/${item.id}/relist`,
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setIsRelisting(false),
                }
            );
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50/70 transition-colors group">
            <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-colors duration-200 ${cfg.bg} ${cfg.color}`}>
                    <Icon size={18} aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                    <p
                        className="text-sm font-semibold text-text-primary truncate transition-colors duration-150 cursor-pointer hover:text-primary"
                        onClick={() => router.visit(`/inventory/detail/${item.id}`)}
                    >
                        {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-text-muted mt-0.5">
                        <span className="font-medium text-text-secondary">👤 {item.sellerName || 'Unknown Seller'}</span>
                        <span>•</span>
                        <span className={`flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded font-mono ${item.daysRemaining <= 7
                                ? 'text-red-700 bg-red-50 border border-red-200/70'
                                : 'text-amber-700 bg-amber-50 border border-amber-200/70'
                            }`}>
                            <Clock size={10} />
                            {item.daysRemaining === 0 ? 'Hari ini' : `${item.daysRemaining} hari lagi`} ({item.leaseEndDate})
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                <button
                    type="button"
                    onClick={handleRelist}
                    disabled={isRelisting}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
                    title="Re-list Property"
                >
                    <RefreshCw size={12} className={`stroke-[2.5] ${isRelisting ? 'animate-spin' : ''}`} />
                    Re-list
                </button>
                <button
                    type="button"
                    onClick={handleWA}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/30 shadow-sm"
                    title="Hubungi Seller via WhatsApp"
                >
                    <Phone size={12} className="stroke-[2.5]" />
                    Hubungi Seller
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
