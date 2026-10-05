import { memo, useState, useCallback, useRef, useMemo } from "react";
import { type PipelineItem, type PipelineStatus, type StageConfig } from "./pipelineTypes";
import PipelineKanbanColumn from "./PipelineKanbanColumn";

interface PipelineKanbanBoardProps<T extends PipelineItem> {
    itemsByStage: Map<PipelineStatus, T[]>;
    stageOrder: PipelineStatus[];
    stageConfigs: Record<PipelineStatus, StageConfig>;
    onStatusChange: (itemId: string, newStatus: PipelineStatus) => void;
    dndType: string;
    renderCard: (item: T, isDragging: boolean, variant: "compact" | "full", isShadow: boolean) => React.ReactNode;
}

function PipelineKanbanBoardComponent<T extends PipelineItem>({
    itemsByStage,
    stageOrder,
    stageConfigs,
    onStatusChange,
    dndType,
    renderCard,
}: PipelineKanbanBoardProps<T>) {
    const draggingItemIdRef = useRef<string | null>(null);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
        draggingItemIdRef.current = itemId;
        // The card already sets the dndType, but we also set id
        e.dataTransfer.setData("text/plain", itemId);
        e.dataTransfer.effectAllowed = "move";

        setTimeout(() => setDraggingItemId(itemId), 0);
    }, []);

    const handleDragEnd = useCallback(() => {
        draggingItemIdRef.current = null;
        setDraggingItemId(null);
    }, []);

    const handleDropLead = useCallback(
        (targetStage: PipelineStatus) => {
            const itemId = draggingItemIdRef.current;
            if (!itemId) return;
            onStatusChange(itemId, targetStage);
            draggingItemIdRef.current = null;
            setDraggingItemId(null);
        },
        [onStatusChange]
    );

    const draggingItem = useMemo(() => {
        if (!draggingItemId) return null;
        for (const stage of stageOrder) {
            const items = itemsByStage.get(stage);
            const found = items?.find(i => i.id === draggingItemId);
            if (found) return found;
        }
        return null;
    }, [draggingItemId, itemsByStage, stageOrder]);

    return (
        <div className="h-full overflow-x-auto custom-scrollbar flex flex-col">
            <div
                className="grid gap-4 flex-1 min-h-0 min-w-max pb-3 pr-2"
                style={{ gridTemplateColumns: `repeat(${stageOrder.length}, minmax(300px, 1fr))` }}
            >
                {stageOrder.map((stage) => (
                    <PipelineKanbanColumn
                        key={stage}
                        stage={stage}
                        stageConfig={stageConfigs[stage]}
                        items={itemsByStage.get(stage) ?? []}
                        onStatusChange={onStatusChange}
                        draggingItem={draggingItem}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDropLead={handleDropLead}
                        dndType={dndType}
                        renderCard={renderCard}
                    />
                ))}
            </div>
        </div>
    );
}

export const PipelineKanbanBoard = memo(PipelineKanbanBoardComponent) as typeof PipelineKanbanBoardComponent;
export default PipelineKanbanBoard;
