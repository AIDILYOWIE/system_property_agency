import { memo } from "react";
import { cn } from "@/lib/utils";
import { type PipelineItem } from "./pipelineTypes";

interface PipelineCardProps<T extends PipelineItem> {
    item: T;
    onStatusChange?: (itemId: string, newStatus: string) => void;
    variant?: "compact" | "full";
    onDragStart?: (e: React.DragEvent, itemId: string) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    isDragging?: boolean;
    isShadow?: boolean;
    dndType: string;
    renderCard: (item: T, isDragging: boolean, variant: "compact" | "full", isShadow: boolean) => React.ReactNode;
}

function PipelineCardComponent<T extends PipelineItem>({
    item,
    variant = "compact",
    onDragStart,
    onDragEnd,
    isDragging = false,
    isShadow = false,
    dndType,
    renderCard,
}: PipelineCardProps<T>) {
    const isLocked = item.status === "lost" || item.status === "won" || item.status === "rejected" || item.status === "listed";
    const canDrag = variant === "compact" && !isShadow && !isLocked;

    return (
        <div
            draggable={canDrag}
            onDragStart={
                canDrag
                    ? (e) => {
                        e.dataTransfer.setData("dndType", dndType);
                        onDragStart?.(e, item.id);
                    }
                    : undefined
            }
            onDragEnd={canDrag ? onDragEnd : undefined}
            className={cn(
                "bg-white rounded-xl border transition-all duration-200",
                canDrag && "cursor-grab active:cursor-grabbing hover:border-primary/20",
                !canDrag && variant === "compact" && !isShadow && "cursor-default",
                variant === "compact" && "border-border-base select-none",
                isLocked && !isShadow && "opacity-60 grayscale-[0.3]",
                variant === "full" && "flex items-center gap-4 px-5 py-4",
                isDragging && !isShadow && "hidden",
                isShadow && "opacity-40 pointer-events-none scale-[0.98] shadow-sm bg-white inset-0"
            )}
        >
            {renderCard(item, isDragging, variant, isShadow)}
        </div>
    );
}

// React.memo with generic type preservation
export const PipelineCard = memo(PipelineCardComponent) as typeof PipelineCardComponent;
export default PipelineCard;
