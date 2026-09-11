import { memo, useMemo, useState } from 'react';

type ChartType = 'actual' | 'today' | 'projected';
interface DataItem {
    label: string;
    d1: number;
    d2: number;
    type: ChartType;
}

const chartData: DataItem[] = [
    { label: 'S', d1: 44, d2: 13, type: 'actual' },
    { label: 'M', d1: 55, d2: 36, type: 'actual' },
    { label: 'T', d1: 41, d2: 20, type: 'actual' },
    { label: 'W', d1: 67, d2: 30, type: 'projected' },
    { label: 'T', d1: 22, d2: 13, type: 'projected' },
    { label: 'F', d1: 43, d2: 27, type: 'projected' },
    { label: 'S', d1: 43, d2: 27, type: 'projected' },
];


const GroupColumnChart = memo(() => {
    const CHART_H = 128;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxTotal = useMemo(() => {
        return Math.max(...chartData.map(d => d.d1 + d.d2), 1);
    }, []);

    const todayIndex = chartData.findIndex(d => d.type === 'today');

    return (
        <div className="bg-white rounded-2xl p-6 border border-border-base col-span-1 md:col-span-2 flex flex-col h-full">
            <h3 className="text-base font-semibold text-text-primary mb-6">Performance Transaction</h3>

            {/* Chart area matching Chart.tsx flex logic perfectly */}
            <div
                className="flex-1 flex items-end justify-between px-2 gap-4 relative"
                style={{ minHeight: CHART_H, marginTop: 32 }}
            >
                {/* Floating tooltip imitating ApexCharts and fully matching the UI */}
                {(() => {
                    const activeIdx = hoveredIndex !== null ? hoveredIndex : todayIndex;
                    if (activeIdx === -1 || activeIdx === null) return null;
                    const activeItem = chartData[activeIdx];
                    const total = activeItem.d1 + activeItem.d2;
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
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-sold"></div>
                                    <span className="font-medium text-text-muted">WON</span>
                                </div>
                                <span className="font-bold text-text-primary">{(activeItem.d1).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-1 gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-available"></div>
                                    <span className="font-medium text-text-muted">LOST</span>
                                </div>
                                <span className="font-bold text-text-primary">{(activeItem.d2).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 mt-0.5 border-t border-border-base gap-3">
                                <span className="font-bold text-text-primary">Total</span>
                                <span className="font-bold text-primary">{(total).toFixed(0)}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Bars built in pure HTML/Tailwind exactly like Chart.tsx */}
                {chartData.map((item, index) => {
                    const total = item.d1 + item.d2;
                    const heightPx = Math.max(Math.round((total / maxTotal) * CHART_H), 16);

                    const q1Percent = (item.d1 / total) * 100;
                    const q2Percent = (item.d2 / total) * 100;
                    const isHovered = hoveredIndex === index;
                    const isToday = item.type === 'today';
                    const isProjected = item.type === 'projected';

                    let barContainerStyle: React.CSSProperties = {
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
                            {/* Bar Pill Wrapper */}
                            <div className="w-full relative flex flex-col justify-end" style={{ height: heightPx }}>
                                {/* The overflow-hidden rounded pill */}
                                <div
                                    className="absolute inset-0 rounded-full overflow-hidden flex flex-col justify-end gap-1"
                                    style={barContainerStyle}
                                >
                                    {/* Q2 Segment (Top) */}
                                    <div
                                        className={`w-full flex-shrink-0 ${isProjected ? 'bg-projected-pattern' : 'bg-status-available'}`}
                                        style={{ height: `${q2Percent}%` }}
                                    />
                                    {/* Q1 Segment (Bottom) with a white top border acting as the GAP between stacks */}
                                    <div
                                        className={`w-full flex-shrink-0 ${isProjected ? 'bg-projected-pattern' : 'bg-status-sold'}`}
                                        style={{ height: `${q1Percent}%` }}
                                    />
                                </div>

                                {/* White ring dot sticking out at top of today's bar */}
                                {isToday && (
                                    <div className="absolute z-10 -top-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-white border border-status-available" />
                                )}
                            </div>

                            {/* Axis Label */}
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
