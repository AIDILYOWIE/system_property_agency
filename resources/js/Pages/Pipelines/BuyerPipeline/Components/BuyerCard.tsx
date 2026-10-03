import { Link } from "@inertiajs/react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { MapPin, MessageCircle, Eye, Calendar } from "lucide-react";
import PipelineStatusDropdown from "../../_Partials/pipeline/PipelineStatusDropdown";
import { type PipelineItem } from "../../_Partials/pipeline/pipelineTypes";
import { formatPrice, timeAgo } from "@/lib/format";


interface BuyerCardProps {
    lead: PipelineItem; // In future, if you make a specific interface BuyerLead extends PipelineItem, change here
    isDragging: boolean;
    variant: "compact" | "full";
    isShadow: boolean;
    onStatusChange?: (id: string, st: string) => void;
    stageOrder: string[];
    stageConfigs: any;
}

export function BuyerCard({ lead, isDragging, variant, isShadow, onStatusChange, stageOrder, stageConfigs }: BuyerCardProps) {
    const isLocked = lead.status === "lost" || lead.status === "won";

    const waUrl = getWhatsAppUrl({
        phone: lead.phone,
        clientName: lead.name,
        propertyNames: [lead.propertyName],
    });

    const initials = lead.name
        ? lead.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    if (variant === "compact") {
        return (
            <div className="p-4 flex flex-col gap-3">
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

                <div className="rounded-lg p-2.5 flex flex-col gap-1">
                    <p className="text-[12px] font-semibold text-text-primary line-clamp-1">
                        {lead.propertyName}
                    </p>
                    <div className="flex items-center gap-1 text-text-muted">
                        <MapPin size={10} className="flex-shrink-0" />
                        <p className="text-[10px] line-clamp-1">{lead.fullAddress}</p>
                    </div>
                    <p className="text-[12px] font-bold text-text-primary mt-0.5">
                        {formatPrice(lead.propertyPrice, lead.propertyCurrency)}
                    </p>
                </div>

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
                        <span className="text-[9px]">{timeAgo(lead.createdAt)}</span>
                    </div>

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
        );
    }

    return (
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
    );
}
