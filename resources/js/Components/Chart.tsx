import { memo, useMemo, useState, type FC } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyLeadData {
    day: string;
    leads: number;
    /** 'actual' = past (dark green solid), 'today' = highlighted (mid-green + floating tooltip), 'projected' = future (gray striped) */
    type: 'actual' | 'today' | 'projected';
}

interface ChartProps {
    data: DailyLeadData[];
    className?: string;
    title: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Pure CSS bar chart – exact port of the reference HTML design.
 *
 * Visual rules (from chris_property_crm.html):
 * - Container: flex items-end, h-32, gap-4, padding-x 8px, relative
 * - 'actual' bar  → bg-primary (#145D40) solid, rounded-full
 * - 'today' bar   → bg-[#52A77A] (mid-green) solid, rounded-full + floating tooltip + white dot at top
 * - 'projected'   → striped repeating-linear-gradient gray (-45deg, transparent 4px, #D1D5DB 4px-6px)
 * - Floating tooltip: absolute, above the 'today' bar, white bg, border, shadow, text-[10px] bold
 * - Day label: text-[10px] font-medium text-textMuted uppercase
 */
const Chart: FC<ChartProps> = memo(({ data, className = '', title }) => {
    const CHART_H = 128;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxLeads = useMemo(() => Math.max(...data.map(d => d.leads), 1), [data]);
    const todayIndex = data.findIndex(d => d.type === 'today');

    // Dot color per bar type – used for the tooltip indicator
    const getDotColor = (type: DailyLeadData['type']) => {
        if (type === 'today') return '#52A77A';
        if (type === 'actual') return '#0A5F41';
        return '#9CA3AF';
    };

    return (
        <div className={`bg-white rounded-2xl p-6 border border-border-base col-span-1 md:col-span-2 flex flex-col ${className}`}>
            <h3 className="text-base font-semibold text-text-primary mb-6">{title}</h3>

            {/* Chart area — extra top padding to make space for tooltips */}
            <div
                className="flex-1 flex items-end justify-between px-2 gap-4 relative"
                style={{ height: CHART_H, marginTop: 32 }}
            >
                {/* ── Floating tooltip ── shows on hover; falls back to 'today' bar */}
                {(() => {
                    const activeIdx = hoveredIndex !== null ? hoveredIndex : todayIndex;
                    if (activeIdx === -1 || activeIdx === null) return null;
                    const activeItem = data[activeIdx];
                    const dotColor = getDotColor(activeItem.type);
                    return (
                        <div
                            className="absolute z-20 bg-white border border-border-base shadow-lg rounded-md px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 pointer-events-none transition-all duration-150"
                            style={{
                                bottom: Math.max(Math.round((activeItem.leads / maxLeads) * CHART_H), 16) + 10,
                                left: `${((activeIdx + 0.5) / data.length) * 100}%`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {activeItem.leads} Leads
                            <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: dotColor }}
                            />
                        </div>
                    );
                })()}

                {/* ── Bars ── */}
                {data.map((item, index) => {
                    const heightPx = Math.max(
                        Math.round((item.leads / maxLeads) * CHART_H),
                        16,
                    );

                    const isToday = item.type === 'today';
                    const isActual = item.type === 'actual';
                    const isHovered = hoveredIndex === index;

                    let barStyle: React.CSSProperties = {
                        height: heightPx,
                        transition: 'opacity 150ms ease, filter 150ms ease',
                        opacity: hoveredIndex !== null && !isHovered ? 0.55 : 1,
                        filter: isHovered ? 'brightness(1.12)' : 'brightness(1)',
                        cursor: 'pointer',
                    };

                    let barClass = 'w-full rounded-full relative';

                    if (isActual) {
                        barClass += ' bg-primary';
                    } else if (isToday) {
                        barClass += ' bg-[#52A77A]';
                    } else {
                        barStyle = {
                            ...barStyle,
                            background:
                                'repeating-linear-gradient(-45deg, transparent, transparent 4px, #D1D5DB 4px, #D1D5DB 6px)',
                        };
                    }

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 w-full"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className={barClass} style={barStyle}>
                                {/* White ring-dot at top of today's bar */}
                                {isToday && (
                                    <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-white border border-[#52A77A]" />
                                )}
                            </div>
                            <span
                                className="text-[10px] font-medium uppercase transition-colors duration-150"
                                style={{
                                    color: isHovered
                                        ? '#0A5F41'
                                        : isToday
                                            ? '#0A5F41'
                                            : '#9CA3AF',
                                    fontWeight: isHovered || isToday ? 600 : 500,
                                }}
                            >
                                {item.day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

Chart.displayName = 'Chart';
export default Chart;
