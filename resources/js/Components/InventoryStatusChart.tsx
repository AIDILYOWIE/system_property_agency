import { memo, useMemo, useState, useId, type FC } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventoryData {
    sold: number;
    available: number;
    draft: number;
    rented: number
}

interface InventoryStatusChartProps {
    data: InventoryData;
    className?: string;
}

// ─── Constants (from reference HTML) ─────────────────────────────────────────
// Arc path: M 10 50 A 40 40 0 0 1 90 50  →  r=40, half‑circle
// Circumference = π × 40 ≈ 125.66
const HC = 125.66; // half-circle arc length in SVG units

// Segment colors exactly from reference
const COLORS = {
    rented: '#003620ff',       // dark primary green
    sold: '#145D40',       // dark primary green
    available: '#52A77A',  // mid green
    draft: '#D1D5DB',      // gray (shown as hatch)
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SVG semi-circle donut chart – pixel-accurate port of chris_property_crm.html:
 *
 * Layer order (bottom → top):
 *  1. Full arc with diagonal-hatch fill → represents Draft
 *  2. Arc with `stroke-dashoffset` clipped to (sold + available) → Available (#52A77A)
 *  3. Arc with `stroke-dashoffset` clipped to (sold) only      → Sold (#145D40)
 *
 * Hover: legend items dim non-hovered segments via opacity transitions.
 * React Best Practices: memo + useMemo for derived SVG values, useId for stable pattern ID.
 */
const InventoryStatusChart: FC<InventoryStatusChartProps> = memo(({ data, className = '' }) => {
    const patternId = useId(); // stable unique SVG pattern ID (avoids SSR mismatch)
    const [hoveredSegment, setHoveredSegment] = useState<'rented' | 'sold' | 'available' | 'draft' | null>(null);

    const { sold, available, draft, rented } = data;
    const total = sold + available + draft + rented;

    // ── Derived SVG dashoffset values ─────────────────────────────────────────
    // Using distinct, non-overlapping segments to prevent opacity blending issues.
    // We achieve this with strokeDasharray=`${length} 1000` and strokeDashoffset=`-${startPosition}`
    const {
        rentedL, soldL, availableL, draftL,
        rentedStart, soldStart, availableStart, draftStart
    } = useMemo(() => {
        if (total === 0) {
            return {
                rentedL: 0, soldL: 0, availableL: 0, draftL: HC,
                rentedStart: 0, soldStart: 0, availableStart: 0, draftStart: 0
            };
        }

        const rL = (rented / total) * HC;
        const sL = (sold / total) * HC;
        const aL = (available / total) * HC;
        const dL = (draft / total) * HC;

        return {
            rentedL: rL,
            soldL: sL,
            availableL: aL,
            draftL: dL,

            rentedStart: 0,
            soldStart: rL,
            availableStart: rL + sL,
            draftStart: rL + sL + aL,
        };
    }, [sold, available, draft, rented, total]);

    // ── Segment opacity on hover ──────────────────────────────────────────────
    const opacity = (seg: 'rented' | 'sold' | 'available' | 'draft') => {
        if (!hoveredSegment) return 1;
        return hoveredSegment === seg ? 1 : 0.2;
    };

    // Arc path (same as reference)
    const ARC = 'M 10 50 A 40 40 0 0 1 90 50';

    return (
        <div className={`bg-white rounded-2xl p-6 border border-border-base flex flex-col items-center justify-center relative ${className}`}>
            {/* Title – absolute top-left, matches reference */}
            <div className="flex items-center justify-start w-full">
                <h3 className="text-base font-semibold text-text-primary">
                    Inventory Status
                </h3>
            </div>

            {/* ── SVG Semi-circle Donut ── */}
            <div className="mt-8 relative flex items-end justify-center" style={{ width: 250, height: 150 }}>
                <svg
                    viewBox="0 0 100 50"
                    className="w-full absolute bottom-0 left-0"
                    aria-label={`Inventory status: ${sold} sold, ${available} available, ${draft} draft out of ${total} total properties`}
                    role="img"
                >
                    <defs>
                        {/* Diagonal hatch pattern for Draft – exact from reference */}
                        <pattern
                            id={patternId}
                            patternUnits="userSpaceOnUse"
                            width="4"
                            height="4"
                        >
                            <path
                                d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                                stroke="#D1D5DB"
                                strokeWidth="1"
                                fill="none"
                            />
                        </pattern>
                    </defs>

                    {/* Segment 1: Rented (Leftmost) */}
                    <path
                        d={ARC}
                        fill="none"
                        stroke={COLORS.rented}
                        strokeWidth="16"
                        strokeLinecap="butt"
                        strokeDasharray={`${rentedL} 1000`}
                        strokeDashoffset={-rentedStart}
                        style={{ opacity: opacity('rented'), transition: 'opacity 200ms ease, stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1), stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1)' }}
                    />

                    {/* Segment 2: Sold */}
                    <path
                        d={ARC}
                        fill="none"
                        stroke={COLORS.sold}
                        strokeWidth="16"
                        strokeLinecap="butt"
                        strokeDasharray={`${soldL} 1000`}
                        strokeDashoffset={-soldStart}
                        style={{ opacity: opacity('sold'), transition: 'opacity 200ms ease, stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1), stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1)' }}
                    />

                    {/* Segment 3: Available */}
                    <path
                        d={ARC}
                        fill="none"
                        stroke={COLORS.available}
                        strokeWidth="16"
                        strokeLinecap="butt"
                        strokeDasharray={`${availableL} 1000`}
                        strokeDashoffset={-availableStart}
                        style={{ opacity: opacity('available'), transition: 'opacity 200ms ease, stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1), stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1)' }}
                    />

                    {/* Segment 4: Draft (Rightmost) */}
                    <path
                        d={ARC}
                        fill="none"
                        stroke={`url(#${patternId})`}
                        strokeWidth="16"
                        strokeLinecap="butt"
                        strokeDasharray={`${draftL} 1000`}
                        strokeDashoffset={-draftStart}
                        style={{ opacity: opacity('draft'), transition: 'opacity 200ms ease, stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1), stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1)' }}
                    />
                </svg>

                {/* Center label */}
                <div className="text-center" style={{ transform: 'translateY(8px)' }}>
                    <p className="font-bold text-text-primary leading-none" style={{ fontSize: 32 }}>
                        {total}
                    </p>
                    <p className="text-text-muted mt-1" style={{ fontSize: 10 }}>Total Properties</p>
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="flex flex-col items-center gap-2 mt-10 w-full text-text-muted" style={{ fontSize: 11 }}>

                <div className='flex gap-4 ' >

                    {/* Rented */}
                    <button
                        type="button"
                        className="flex items-center gap-1 cursor-pointer transition-opacity duration-200 focus:outline-none"
                        style={{ opacity: hoveredSegment && hoveredSegment !== 'rented' ? 0.4 : 1 }}
                        onMouseEnter={() => setHoveredSegment('rented')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        aria-label={`Rented: ${rented} properties`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.rented }} />
                        <span className="font-medium">Rented</span>
                        <span className="font-bold text-text-primary ml-0.5">{rented}</span>
                    </button>

                    {/* Sold */}
                    <button
                        type="button"
                        className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 focus:outline-none"
                        style={{ opacity: hoveredSegment && hoveredSegment !== 'sold' ? 0.4 : 1 }}
                        onMouseEnter={() => setHoveredSegment('sold')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        aria-label={`Sold: ${sold} properties`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.sold }} />
                        <span className="font-medium">Sold</span>
                        <span className="font-bold text-text-primary ml-0.5">{sold}</span>
                    </button>
                </div>

                <div className='flex gap-4'>
                    {/* Available */}
                    <button
                        type="button"
                        className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 focus:outline-none"
                        style={{ opacity: hoveredSegment && hoveredSegment !== 'available' ? 0.4 : 1 }}
                        onMouseEnter={() => setHoveredSegment('available')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        aria-label={`Available: ${available} properties`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.available }} />
                        <span className="font-medium">Available</span>
                        <span className="font-bold text-text-primary ml-0.5">{available}</span>
                    </button>

                    {/* Draft (hatched dot) */}
                    <button
                        type="button"
                        className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 focus:outline-none"
                        style={{ opacity: hoveredSegment && hoveredSegment !== 'draft' ? 0.4 : 1 }}
                        onMouseEnter={() => setHoveredSegment('draft')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        aria-label={`Draft: ${draft} properties`}
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                                background:
                                    'repeating-linear-gradient(-45deg, transparent, transparent 1px, #D1D5DB 1px, #D1D5DB 2px)',
                            }}
                        />
                        <span className="font-medium">Draft</span>
                        <span className="font-bold text-text-primary ml-0.5">{draft}</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

InventoryStatusChart.displayName = 'InventoryStatusChart';
export default InventoryStatusChart;
