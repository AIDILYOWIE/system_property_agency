import { cn } from "@/lib/utils";
import { type PipelineStatus, type StageConfig } from "./pipelineTypes";

interface PipelineStageBarProps {
    activeStage: PipelineStatus | "all";
    countByStage: Map<PipelineStatus, number>;
    totalCount: number;
    stageOrder: PipelineStatus[];
    stageConfigs: Record<PipelineStatus, StageConfig>;
    onChange: (stage: PipelineStatus | "all") => void;
}

export default function PipelineStageBar({
    activeStage,
    countByStage,
    totalCount,
    stageOrder,
    stageConfigs,
    onChange,
}: PipelineStageBarProps) {
    return (
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 pt-1 -mt-1 -mb-2">
            <button
                type="button"
                onClick={() => onChange("all")}
                className={cn(
                    "flex flex-col gap-1 items-start min-w-[90px] px-3 py-2 rounded-xl border transition-all duration-200 text-left shrink-0",
                    activeStage === "all"
                        ? "bg-primary border-primary shadow-sm"
                        : "bg-white border-border-base hover:border-primary/20",
                )}
            >
                <span
                    className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        activeStage === "all" ? "text-white" : "text-text-muted",
                    )}
                >
                    All Leads
                </span>
                <span
                    className={cn(
                        "text-lg font-bold leading-none",
                        activeStage === "all" ? "text-white" : "text-text-primary",
                    )}
                >
                    {totalCount}
                </span>
            </button>

            {stageOrder.map((stage) => {
                const config = stageConfigs[stage];
                const isActive = activeStage === stage;
                const count = countByStage.get(stage) || 0;

                return (
                    <button
                        key={stage}
                        type="button"
                        onClick={() => onChange(stage)}
                        className={cn(
                            "flex flex-col gap-1 items-start min-w-[90px] px-3 py-2 rounded-xl border transition-all duration-200 text-left shrink-0",
                            isActive
                                ? "bg-white shadow-sm ring-1 ring-primary/20"
                                : "bg-canvas/50 hover:bg-canvas opacity-80",
                            isActive ? config?.borderColor : "border-border-base",
                        )}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", config?.dotColor)} />
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                {config?.label || stage}
                            </span>
                        </div>
                        <span className="text-lg font-bold text-text-primary leading-none ml-3">
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
