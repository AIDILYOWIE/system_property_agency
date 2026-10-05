import { Link } from "@inertiajs/react";
import { MapPin, MessageCircle, Eye, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice, timeAgo } from "@/lib/format";
import PipelineStatusDropdown from "../../_Partials/pipeline/PipelineStatusDropdown";
import { type PipelineItem, type StageConfig } from "../../_Partials/pipeline/pipelineTypes";

// ─── Category display map ────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
    house: "House",
    shophouse: "Ruko",
    land: "Land",
    apartment: "Apt",
    strategic_land: "Str. Land",
    commercial: "Commercial",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PropertyCardProps {
    lead: PipelineItem & {
        propertyTitle?: string;
        category?: string;
        listingType?: "sale" | "rent";
        estimatedPrice?: number | null;
        currency?: string;
        locationArea?: string;
        sellerName?: string;
        sellerPhone?: string;
        sellerId?: string;
        notes?: string | null;
        createdAt?: string;
    };
    isDragging: boolean;
    variant: "compact" | "full";
    isShadow: boolean;
    onStatusChange?: (id: string, newStatus: string) => void;
    stageOrder: string[];
    stageConfigs: Record<string, StageConfig>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertyCard({
    lead,
    variant,
    isShadow,
    onStatusChange,
    stageOrder,
    stageConfigs,
}: PropertyCardProps) {
    const isLocked = lead.status === "listed" || lead.status === "rejected";

    const waUrl = lead.sellerPhone
        ? getWhatsAppUrl({
            phone: lead.sellerPhone,
            clientName: lead.sellerName ?? "-",
            propertyNames: [lead.propertyTitle ?? lead.name ?? ""],
        })
        : "#";

    const categoryLabel =
        CATEGORY_LABELS[lead.category ?? ""] ?? lead.category ?? "-";
    const listingBadge = lead.listingType === "sale" ? "For Sale" : "For Rent";
    const priceDisplay =
        lead.estimatedPrice
            ? formatPrice(lead.estimatedPrice, lead.currency ?? "IDR")
            : "Price TBD";

    if (variant === "compact") {
        return (
            <div className="p-4 flex flex-col gap-3">
                {/* Header: category + listing type */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                        <Tag size={8} />
                        {categoryLabel}
                    </span>
                    <span className="text-[9px] font-semibold text-text-muted bg-canvas border border-border-base px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {listingBadge}
                    </span>
                </div>

                {/* Property info */}
                <div className="flex flex-col gap-1">
                    <p className="text-[13px] font-semibold text-text-primary line-clamp-2 leading-tight">
                        {lead.propertyTitle ?? lead.name}
                    </p>
                    {/* {lead.locationArea && lead.locationArea !== "-" && (
                        <div className="flex items-center gap-1 text-text-muted">
                            <MapPin size={10} className="flex-shrink-0" />
                            <p className="text-[10px] line-clamp-1">{lead.locationArea}</p>
                        </div>
                    )} */}
                    <p className="text-[12px] font-bold text-text-primary mt-0.5">
                        {priceDisplay}
                    </p>
                </div>

                {/* Seller info */}
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-border-base flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-bold text-slate-500">
                            {(lead.sellerName ?? "?")[0]?.toUpperCase()}
                        </span>
                    </div>
                    {lead.sellerId ? (
                        <Link
                            href={route("seller.show", lead.sellerId)}
                            className="text-[11px] text-text-muted hover:text-primary transition-colors line-clamp-1"
                            onClick={(e) => e.stopPropagation()}
                            draggable={false}
                        >
                            {lead.sellerName ?? "-"}
                        </Link>
                    ) : (
                        <p className="text-[11px] text-text-muted line-clamp-1">
                            {lead.sellerName ?? "-"}
                        </p>
                    )}
                </div>

                {/* Footer: status dropdown (mobile) + actions */}
                <div className="lg:hidden">
                    {onStatusChange && (
                        <PipelineStatusDropdown
                            leadId={lead.id}
                            currentStatus={lead.status}
                            onChange={onStatusChange}
                            disabled={isLocked}
                            stageOrder={stageOrder}
                            stageConfigs={stageConfigs}
                        />
                    )}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-text-muted/60">
                        <Calendar size={9} />
                        <span className="text-[9px]">
                            {lead.createdAt ? timeAgo(lead.createdAt) : "-"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {lead.sellerId && (
                            <Link
                                href={route("seller.show", lead.sellerId)}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg border border-border-base flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
                                draggable={false}
                            >
                                <Eye size={12} />
                            </Link>
                        )}
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
        );
    }

    // ── List / full variant ──────────────────────────────────────────────────
    return (
        <>
            {/* Category icon */}
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-[10px] border border-primary/20 uppercase">
                {categoryLabel.slice(0, 3)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-text-primary line-clamp-1">
                        {lead.propertyTitle ?? lead.name}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-canvas px-1.5 py-0.5 rounded border border-border-base text-text-muted">
                        {listingBadge}
                    </span>
                </div>
                {/* <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {lead.locationArea && lead.locationArea !== "-" && (
                        <p className="text-[11px] text-text-muted line-clamp-1 flex items-center gap-0.5">
                            <MapPin size={9} />
                            {lead.locationArea}
                        </p>
                    )}
                    <span className="text-text-muted/40">·</span>
                    <p className="text-[11px] font-bold text-text-primary flex-shrink-0">
                        {priceDisplay}
                    </p>
                </div> */}
            </div>

            {/* Seller */}
            {lead.sellerId ? (
                <Link
                    href={route("seller.show", lead.sellerId)}
                    className={cn(
                        "hidden sm:flex items-center gap-1.5 text-[11px] text-text-muted hover:text-primary transition-colors flex-shrink-0"
                    )}
                >
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-border-base flex items-center justify-center">
                        <span className="text-[8px] font-bold text-slate-500">
                            {(lead.sellerName ?? "?")[0]?.toUpperCase()}
                        </span>
                    </div>
                    <span className="line-clamp-1 max-w-[100px]">{lead.sellerName}</span>
                </Link>
            ) : null}

            <div className="hidden md:flex items-center gap-1 text-text-muted/60 flex-shrink-0">
                <Calendar size={10} />
                <span className="text-[10px]">
                    {lead.createdAt ? timeAgo(lead.createdAt) : "-"}
                </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                {onStatusChange && (
                    <PipelineStatusDropdown
                        leadId={lead.id}
                        currentStatus={lead.status}
                        onChange={onStatusChange}
                        disabled={isLocked}
                        stageOrder={stageOrder}
                        stageConfigs={stageConfigs}
                    />
                )}
                {lead.sellerId && (
                    <Link
                        href={route("seller.show", lead.sellerId)}
                        className="w-8 h-8 rounded-lg border border-border-base flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
                    >
                        <Eye size={13} />
                    </Link>
                )}
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
    );
}
