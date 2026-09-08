import { memo, useState, useCallback, useRef, useMemo } from "react";
import { STAGE_ORDER } from "./pipelineConstants";
import { type PipelineLead, type BuyerPipelineStatus } from "./pipelineTypes";
import PipelineKanbanColumn from "./PipelineKanbanColumn";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineKanbanBoardProps {
    leadsByStage: Map<BuyerPipelineStatus, PipelineLead[]>;
    onStatusChange: (leadId: string, newStatus: BuyerPipelineStatus) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

const PipelineKanbanBoard = memo(function PipelineKanbanBoard({
    leadsByStage,
    onStatusChange,
}: PipelineKanbanBoardProps) {
    // ── Drag state ────────────────────────────────────────────────────────────
    // Use a ref to store the dragging ID so it doesn't cause re-renders of the
    // board itself on every drag event — only state triggers column re-renders.
    const draggingLeadIdRef = useRef<string | null>(null);
    const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
        draggingLeadIdRef.current = leadId;
        // Store ID in dataTransfer as fallback
        e.dataTransfer.setData("text/plain", leadId);
        e.dataTransfer.effectAllowed = "move";

        // Wait a macro-tick so browser captures the drag image before we hide the original card
        setTimeout(() => setDraggingLeadId(leadId), 0);
    }, []);

    const handleDragEnd = useCallback(() => {
        draggingLeadIdRef.current = null;
        setDraggingLeadId(null);
    }, []);

    const handleDropLead = useCallback(
        (targetStage: BuyerPipelineStatus) => {
            const leadId = draggingLeadIdRef.current;
            if (!leadId) return;
            onStatusChange(leadId, targetStage);
            draggingLeadIdRef.current = null;
            setDraggingLeadId(null);
        },
        [onStatusChange]
    );

    const draggingLead = useMemo(() => {
        if (!draggingLeadId) return null;
        for (const stage of STAGE_ORDER) {
            const leads = leadsByStage.get(stage);
            const found = leads?.find(l => l.id === draggingLeadId);
            if (found) return found;
        }
        return null;
    }, [draggingLeadId, leadsByStage]);

    return (
        <div className="h-full overflow-x-auto custom-scrollbar flex flex-col">
            <div
                className="grid gap-4 flex-1 min-h-0 min-w-max pb-3 pr-2"
                style={{ gridTemplateColumns: "repeat(6, minmax(300px, 1fr))" }}
            >
                {STAGE_ORDER.map((stage) => (
                    <PipelineKanbanColumn
                        key={stage}
                        stage={stage}
                        leads={leadsByStage.get(stage) ?? []}
                        onStatusChange={onStatusChange}
                        draggingLead={draggingLead}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDropLead={handleDropLead}
                    />
                ))}
            </div>
        </div>
    );
});

export default PipelineKanbanBoard;
