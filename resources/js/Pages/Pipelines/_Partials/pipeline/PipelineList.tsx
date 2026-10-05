import { memo } from "react";
import { type PipelineItem, type PipelineStatus, type StageConfig } from "./pipelineTypes";
import PipelineCard from "./PipelineCard";

interface PipelineListProps<T extends PipelineItem> {
    items: T[];
    stageConfigs: Record<PipelineStatus, StageConfig>;
    onStatusChange: (itemId: string, newStatus: PipelineStatus) => void;
    renderCard: (item: T, isDragging: boolean, variant: "compact" | "full", isShadow: boolean) => React.ReactNode;
}

function PipelineListComponent<T extends PipelineItem>({
    items,
    stageConfigs,
    onStatusChange,
    renderCard,
}: PipelineListProps<T>) {
    return (
        <div className="flex flex-col gap-2">
            {items.map((item) => (
                <PipelineCard
                    key={item.id}
                    item={item}
                    onStatusChange={onStatusChange}
                    variant="full"
                    dndType="none" // List view cards aren't draggable typically
                    renderCard={renderCard}
                />
            ))}
            {items.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-border-base border-dashed mt-4">
                    <p className="text-[13px] text-text-muted mt-2 font-medium">No items found</p>
                    <p className="text-[11.5px] text-text-muted/60 mt-1">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}

export const PipelineList = memo(PipelineListComponent) as typeof PipelineListComponent;
export default PipelineList;
