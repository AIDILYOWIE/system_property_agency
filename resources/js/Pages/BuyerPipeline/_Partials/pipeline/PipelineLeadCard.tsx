import { memo } from "react";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { MapPin, MessageCircle, Eye, Calendar, GripVertical } from "lucide-react";
import { STAGE_CONFIG } from "./pipelineConstants";
import { type PipelineLead, type BuyerPipelineStatus } from "./pipelineTypes";
import PipelineStatusDropdown from "./PipelineStatusDropdown";

// ─── Helpers (hoisted — pure functions, no closure deps) ────────────────────────

function formatPrice(price: number, currency: string): string {
    if (currency === "IDR") {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: "compact",
            compactDisplay: "short",
        }).format(price);
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        notation: "compact",
        compactDisplay: "short",
    }).format(price);
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineLeadCardProps {
    lead: PipelineLead;
    onStatusChange: (leadId: string, newStatus: BuyerPipelineStatus) => void;
    /** compact = for kanban columns, full = for list view */
    variant?: "compact" | "full";
    /** DnD callbacks — only used in compact/kanban variant */
    onDragStart?: (e: React.DragEvent, leadId: string) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    isDragging?: boolean;
    /** If true, renders as a drag-and-drop placeholder shadow */
    isShadow?: boolean;
}

// ─── Component (memoized) ────────────────────────────────────────────────────────

const PipelineLeadCard = memo(function PipelineLeadCard({
    lead,
    onStatusChange,
    variant = "compact",
    onDragStart,
    onDragEnd,
    isDragging = false,
    isShadow = false,
}: PipelineLeadCardProps) {
    const isLost = lead.status === "lost";

    const waUrl = getWhatsAppUrl({
        phone: lead.phone,
        clientName: lead.name,
        propertyNames: [lead.propertyName],
    });

    const initials = lead.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <div
            draggable={variant === "compact" && !isShadow}
            onDragStart={
                variant === "compact" && !isShadow
                    ? (e) => onDragStart?.(e, lead.id)
                    : undefined
            }
            onDragEnd={variant === "compact" && !isShadow ? onDragEnd : undefined}
            className={cn(
                "bg-white rounded-xl border transition-all duration-200",
                variant === "compact" && !isShadow && "cursor-grab active:cursor-grabbing select-none hover:border-primary/20",
                variant === "compact" && "border-border-base",
                isLost && !isShadow && "opacity-60",
                variant === "full" && "flex items-center gap-4 px-5 py-4",

                // Active original card fades to nothing so the shadow takes over visually
                isDragging && !isShadow && "hidden",

                // Shadow / Placeholder logic
                isShadow && "opacity-40 pointer-events-none scale-[0.98] shadow-sm bg-white inset-0"
            )}
        >
            {variant === "compact" ? (
                /* ── Kanban compact card ── */
                <div className="p-4 flex flex-col gap-3">
                    {/* Header: drag grip + avatar + name */}
                    {/* Drag handle — subtle, appears on hover */}
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-[11px] border border-primary/20 select-none">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-text-primary line-clamp-1">
                                {lead.name}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                                {lead.customerType === "renter" ? "Renter" : "Buyer"}
                            </p>
                        </div>
                    </div>

                    {/* Property info */}
                    <div className="bg-canvas rounded-lg p-2.5 flex flex-col gap-1">
                        <p className="text-[12px] font-semibold text-text-primary line-clamp-1">
                            {lead.propertyName}
                        </p>
                        <div className="flex items-center gap-1 text-text-muted">
                            <MapPin size={10} className="flex-shrink-0" />
                            <p className="text-[10px] line-clamp-1">{lead.propertyLocation}</p>
                        </div>
                        <p className="text-[12px] font-bold text-text-primary mt-0.5">
                            {formatPrice(lead.propertyPrice, lead.propertyCurrency)}
                        </p>
                    </div>

                    {/* Footer: status dropdown (mobile/tablet only) */}
                    <div className="lg:hidden">
                        <PipelineStatusDropdown
                            leadId={lead.id}
                            currentStatus={lead.status}
                            onChange={onStatusChange}
                        />
                    </div>

                    {/* Footer: timestamp + action buttons (always visible, in one row) */}
                    <div className="flex items-center justify-between gap-2">
                        {/* Timestamp — left side */}
                        <div className="flex items-center gap-1 text-text-muted/60">
                            <Calendar size={9} />
                            <span className="text-[9px]">{timeAgo(lead.createdAt)}</span>
                        </div>

                        {/* Action buttons — right side */}
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={`/customer/detail/${lead.customerId}`}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg border border-border-base flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
                                draggable={false}
                            >
                                <Eye size={12} />
                            </Link>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
                                draggable={false}
                            >
                                <MessageCircle size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── List full-width row ── */
                <>
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-[12px] border border-primary/20 select-none">
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-text-primary">
                                {lead.name}
                            </p>
                            <span className="text-[10px] text-text-muted font-medium bg-canvas px-1.5 py-0.5 rounded border border-border-base">
                                {lead.customerType === "renter" ? "Renter" : "Buyer"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[11px] text-text-muted line-clamp-1">
                                {lead.propertyName}
                            </p>
                            <span className="text-text-muted/40">·</span>
                            <p className="text-[11px] font-bold text-text-primary flex-shrink-0">
                                {formatPrice(lead.propertyPrice, lead.propertyCurrency)}
                            </p>
                        </div>
                    </div>

                    <span className="hidden sm:inline-flex text-[10px] font-semibold text-text-muted bg-canvas px-2 py-1 rounded-md border border-border-base uppercase tracking-wider flex-shrink-0">
                        {lead.source}
                    </span>

                    <div className="hidden md:flex items-center gap-1 text-text-muted/60 flex-shrink-0">
                        <Calendar size={10} />
                        <span className="text-[10px]">{timeAgo(lead.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <PipelineStatusDropdown
                            leadId={lead.id}
                            currentStatus={lead.status}
                            onChange={onStatusChange}
                        />
                        <Link
                            href={`/customer/detail/${lead.customerId}`}
                            className="w-8 h-8 rounded-lg border border-border-base flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
                        >
                            <Eye size={13} />
                        </Link>
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
                        >
                            <MessageCircle size={13} />
                        </a>
                    </div>
                </>
            )}
        </div>
    );
});

export default PipelineLeadCard;
