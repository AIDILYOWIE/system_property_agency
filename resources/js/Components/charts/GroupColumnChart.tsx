import { memo, useMemo, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ChartType = 'actual' | 'today' | 'projected';

export interface PerformanceDataItem {
    label: string;
    won: number;
    lost: number;
    type: ChartType;
}

interface GroupColumnChartProps {
    data: PerformanceDataItem[];
}

// ─── Fallback skeleton for when no data has arrived yet ────────────────────────

const EMPTY_WEEK: PerformanceDataItem[] = [
    { label: 'S', won: 0, lost: 0, type: 'projected' },
    { label: 'M', won: 0, lost: 0, type: 'projected' },
    { label: 'T', won: 0, lost: 0, type: 'projected' },
    { label: 'W', won: 0, lost: 0, type: 'projected' },
    { label: 'T', won: 0, lost: 0, type: 'projected' },
    { label: 'F', won: 0, lost: 0, type: 'projected' },
    { label: 'S', won: 0, lost: 0, type: 'projected' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const GroupColumnChart = memo(({ data }: GroupColumnChartProps) => {
    const CHART_H = 128;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Use server data or fallback to an empty skeleton
    const chartData = data?.length === 7 ? data : EMPTY_WEEK;

    // Max bar height is driven by the tallest total (won + lost) on any day.
    // Minimum 1 prevents division-by-zero when there is no data yet.
    const maxTotal = useMemo(
        () => Math.max(...chartData.map(d => d.won + d.lost), 1),
        [chartData],
    );

    const todayIndex = chartData.findIndex(d => d.type === 'today');

    return (
        <div className="bg-white rounded-2xl p-6 border border-border-base col-span-1 md:col-span-2 flex flex-col h-full">
            <h3 className="text-base font-semibold text-text-primary mb-6">Performance Transaction</h3>

            <div
                className="flex-1 flex items-end justify-between px-2 gap-4 relative"
                style={{ minHeight: CHART_H, marginTop: 32 }}
            >
                {/* Floating tooltip — shows on hover, falls back to today's bar */}
                {(() => {
                    const activeIdx = hoveredIndex !== null ? hoveredIndex : todayIndex;
                    if (activeIdx === -1 || activeIdx === null) return null;
                    const activeItem = chartData[activeIdx];
                    const total = activeItem.won + activeItem.lost;
                    return (
                        <div
                            className="absolute z-20 bg-white border border-border-base shadow-lg rounded-md px-3 py-2 text-[10px] min-w-[110px] flex flex-col font-sans pointer-events-none transition-all duration-150"
                            style={{
                                bottom: Math.max(Math.round((total / maxTotal) * CHART_H), 16) + 10,
                                left: `${((activeIdx + 0.5) / chartData.length) * 100}%`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="flex justify-between items-center mb-1 gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-sold" />
                                    <span className="font-medium text-text-muted">WON</span>
                                </div>
                                <span className="font-bold text-text-primary">{activeItem.won}</span>
                            </div>
                            <div className="flex justify-between items-center mb-1 gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-available" />
                                    <span className="font-medium text-text-muted">LOST</span>
                                </div>
                                <span className="font-bold text-text-primary">{activeItem.lost}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 mt-0.5 border-t border-border-base gap-3">
                                <span className="font-bold text-text-primary">Total</span>
                                <span className="font-bold text-primary">{total}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Bar columns */}
                {chartData.map((item, index) => {
                    const total = item.won + item.lost;
                    // Ensure a minimum visual height of 16px so zero-data days still render
                    const heightPx = Math.max(Math.round((total / maxTotal) * CHART_H), 16);

                    // Percentage split inside the pill
                    const wonPercent = total > 0 ? (item.won / total) * 100 : 50;
                    const lostPercent = total > 0 ? (item.lost / total) * 100 : 50;

                    const isHovered = hoveredIndex === index;
                    const isToday = item.type === 'today';
                    const isProjected = item.type === 'projected';

                    const barStyle: React.CSSProperties = {
                        height: heightPx,
                        transition: 'opacity 150ms ease, filter 150ms ease',
                        opacity: hoveredIndex !== null && !isHovered ? 0.55 : 1,
                        filter: isHovered ? 'brightness(1.12)' : 'brightness(1)',
                        cursor: 'pointer',
                    };

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 w-full"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Bar pill wrapper */}
                            <div className="w-full relative flex flex-col justify-end" style={{ height: heightPx }}>
                                <div
                                    className="absolute inset-0 rounded-full overflow-hidden flex flex-col justify-end gap-1"
                                    style={barStyle}
                                >
                                    {/* LOST segment (top) */}
                                    <div
                                        className={`w-full flex-shrink-0 ${isProjected ? 'bg-projected-pattern' : 'bg-status-available'}`}
                                        style={{ height: `${lostPercent}%` }}
                                    />
                                    {/* WON segment (bottom) */}
                                    <div
                                        className={`w-full flex-shrink-0 ${isProjected ? 'bg-projected-pattern' : 'bg-status-sold'}`}
                                        style={{ height: `${wonPercent}%` }}
                                    />
                                </div>

                                {/* Today indicator dot */}
                                {isToday && (
                                    <div className="absolute z-10 -top-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-white border border-status-available" />
                                )}
                            </div>

                            {/* Axis label */}
                            <span
                                className={`text-[10px] uppercase transition-colors duration-150 ${isHovered || isToday ? 'text-primary font-semibold' : 'text-text-muted font-medium'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

GroupColumnChart.displayName = 'GroupColumnChart';
export default GroupColumnChart;
