import { memo, type FC } from 'react';
import { Home, MapPin, Building2, Landmark, ArrowRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PropertyType = 'villa' | 'land' | 'commercial' | 'house';

export interface PropertyListingItem {
    id: string | number;
    name: string;
    location: string;
    type: PropertyType;
    daysListed: number;
    leads: number;
    /** href for the "View" button */
    href?: string;
}

interface PropertyListingCardProps {
    listings: PropertyListingItem[];
    viewAllHref?: string;
    className?: string;
}

// ─── Icon map (direct imports — no barrel, better bundle) ────────────────────
const TYPE_CONFIG: Record<PropertyType, { icon: typeof Home; bg: string; color: string }> = {
    villa: { icon: Home, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    house: { icon: Home, bg: 'bg-green-50', color: 'text-green-600' },
    land: { icon: MapPin, bg: 'bg-amber-50', color: 'text-amber-500' },
    commercial: { icon: Building2, bg: 'bg-blue-50', color: 'text-blue-500' },
};

// ─── Single list item (memoised to prevent re-render when siblings change) ───

const ListingRow: FC<{ item: PropertyListingItem }> = memo(({ item }) => {
    const cfg = TYPE_CONFIG[item.type];
    const Icon = cfg.icon;

    return (
        // Exact pattern from reference: flex items-center gap-4, hover effect on row
        <div className="flex items-center gap-4 group cursor-pointer">
            {/* Rounded icon container — exact size/shape from reference */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${cfg.bg} ${cfg.color}`}>
                <Icon size={18} aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate transition-colors duration-150">
                    {item.name}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                    {item.location} &nbsp;•&nbsp; {item.daysListed}d ago &nbsp;•&nbsp; {item.leads} Leads
                </p>
            </div>

            {/* Action button — exact style from reference */}
            <a
                href={item.href ?? '#'}
                className="flex-shrink-0 px-3 py-1.5 text-[11px] font-semibold bg-white border border-border-base text-text-primary rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label={`View ${item.name}`}
            >
                View
            </a>
        </div>
    );
});
ListingRow.displayName = 'ListingRow';

// ─── Card ─────────────────────────────────────────────────────────────────────

const PropertyListingCard: FC<PropertyListingCardProps> = memo(
    ({ listings, viewAllHref = '#', className = '' }) => (
        // Exact card structure from reference Stale Listings card
        <div className={`bg-white rounded-2xl p-6 border border-border-base flex flex-col ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-text-primary">New Listings</h3>
                <a
                    href={viewAllHref}
                    className="text-xs border border-border-base rounded-full px-3 py-1 text-text-primary hover:bg-gray-50 flex items-center gap-1 font-medium transition-colors duration-150"
                    aria-label="View all new property listings"
                >
                    View All
                    <ArrowRight size={12} aria-hidden="true" />
                </a>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4">
                {listings.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-4">No new listings yet.</p>
                ) : (
                    listings.map(item => <ListingRow key={item.id} item={item} />)
                )}
            </div>
        </div>
    ),
);
PropertyListingCard.displayName = 'PropertyListingCard';

export default PropertyListingCard;
