import { cn } from "@/lib/utils";
import { STAGE_ORDER, STAGE_CONFIG } from "./pipelineConstants";
import { type BuyerPipelineStatus } from "./pipelineTypes";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineStageBarProps {
    activeStage: BuyerPipelineStatus | "all";
    countByStage: Map<BuyerPipelineStatus, number>;
    totalCount: number;
    onChange: (stage: BuyerPipelineStatus | "all") => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PipelineStageBar({
    activeStage,
    countByStage,
    totalCount,
    onChange,
}: PipelineStageBarProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* All tab */}
            <button
                type="button"
                onClick={() => onChange("all")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150",
                    activeStage === "all"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-text-muted border-border-base hover:border-primary/30 hover:text-text-primary"
                )}
            >
                All
                <span
                    className={cn(
                        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                        activeStage === "all"
                            ? "bg-white/20 text-white"
                            : "bg-canvas text-text-muted"
                    )}
                >
                    {totalCount}
                </span>
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-border-base mx-1" />

            {/* Stage tabs */}
            {STAGE_ORDER.map((stage) => {
                const cfg = STAGE_CONFIG[stage];
                const count = countByStage.get(stage) ?? 0;
                const isActive = activeStage === stage;

                return (
                    <button
                        key={stage}
                        type="button"
                        onClick={() => onChange(stage)}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150",
                            isActive
                                ? `${cfg.color} ${cfg.textColor} ${cfg.borderColor} shadow-sm`
                                : "bg-white text-text-muted border-border-base hover:border-border-base/80 hover:text-text-primary"
                        )}
                    >
                        {/* Status dot */}
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                isActive ? cfg.dotColor : "bg-text-muted/40"
                            )}
                        />
                        {cfg.label}
                        <span
                            className={cn(
                                "inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[9px] font-bold",
                                isActive
                                    ? `${cfg.color} ${cfg.textColor}`
                                    : "bg-canvas text-text-muted"
                            )}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
