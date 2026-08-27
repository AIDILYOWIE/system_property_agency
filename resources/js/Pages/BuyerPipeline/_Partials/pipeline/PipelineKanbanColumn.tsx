import { memo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { STAGE_CONFIG } from "./pipelineConstants";
import { type PipelineLead, type BuyerPipelineStatus } from "./pipelineTypes";
import PipelineLeadCard from "./PipelineLeadCard";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineKanbanColumnProps {
    stage: BuyerPipelineStatus;
    leads: PipelineLead[];
    onStatusChange: (leadId: string, newStatus: BuyerPipelineStatus) => void;
    /** The lead currently being dragged, passed by the board */
    draggingLead: PipelineLead | null;
    onDragStart: (e: React.DragEvent, leadId: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDropLead: (targetStage: BuyerPipelineStatus) => void;
}

// ─── Component (memoized) ────────────────────────────────────────────────────────

const PipelineKanbanColumn = memo(function PipelineKanbanColumn({
    stage,
    leads,
    onStatusChange,
    draggingLead,
    onDragStart,
    onDragEnd,
    onDropLead,
}: PipelineKanbanColumnProps) {
    const cfg = STAGE_CONFIG[stage];
    const [isDragOver, setIsDragOver] = useState(false);

    // Only activate drop zone when a card from another column is dragged over
    const isDraggingFromOtherColumn =
        draggingLead !== null &&
        !leads.some((l) => l.id === draggingLead.id);

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            if (!isDraggingFromOtherColumn) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setIsDragOver(true);
        },
        [isDraggingFromOtherColumn]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // Only clear if leaving the column container itself (not a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            onDropLead(stage);
        },
        [stage, onDropLead]
    );

    return (
        <div className="flex flex-col min-w-0 h-full">
            {/* Column header */}
            <div
                className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0 transition-colors duration-150",
                    `${cfg.columnBg} border-border-base`
                )}
            >
                <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-150", cfg.dotColor, isDragOver && "scale-125")} />
                    <span className={cn("text-[11px] font-bold uppercase tracking-wider", cfg.textColor)}>
                        {cfg.label}
                    </span>
                </div>
                <span
                    className={cn(
                        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold border transition-all duration-150",
                        cfg.color,
                        cfg.textColor,
                        cfg.borderColor
                    )}
                >
                    {leads.length}
                </span>
            </div>

            {/* Drop zone + cards container */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex-1 border border-t-0 rounded-b-xl overflow-y-auto p-2 flex flex-col gap-2 transition-all duration-150",
                    "bg-canvas/50 border-border-base"
                )}
            >

                {/* Shadow skeleton card shown when dragging over from another column */}
                {isDragOver && draggingLead && isDraggingFromOtherColumn && (
                    <PipelineLeadCard
                        key="shadow"
                        lead={draggingLead}
                        onStatusChange={onStatusChange}
                        variant="compact"
                        isShadow={true}
                    />
                )}

                {leads.length === 0 && !isDragOver ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Users size={20} className="text-border-base mb-2" />
                        <p className="text-[11px] text-text-muted/60">No leads</p>
                    </div>
                ) : (
                    leads.map((lead) => (
                        <PipelineLeadCard
                            key={lead.id}
                            lead={lead}
                            onStatusChange={onStatusChange}
                            variant="compact"
                            isDragging={draggingLead?.id === lead.id}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))
                )}
            </div>
        </div>
    );
});

export default PipelineKanbanColumn;
