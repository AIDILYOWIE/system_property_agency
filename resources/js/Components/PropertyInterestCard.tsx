import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { type PipelineStatus } from "@/Pages/Customer/_Partials/CustomerColumn";

// ─── Types (exported for reuse by parent pages) ─────────────────────────────────

export interface PropertyInterestItem {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: "IDR" | "USD";
    thumbnail: string;
    listingType: "For Sale" | "For Rent";
    status: "available" | "sold" | "rented";
    pipelineStatus: PipelineStatus;
}

// ─── Pipeline badge config (hoisted — never re-created on render) ───────────────

const PIPELINE_CONFIG: Record<PipelineStatus, { label: string; color: string }> = {
    new_lead: { label: "New Lead", color: "bg-blue-50 text-blue-600 border-blue-200" },
    contacted: { label: "Contacted", color: "bg-amber-50 text-amber-600 border-amber-200" },
    viewing: { label: "Viewing", color: "bg-violet-50 text-violet-600 border-violet-200" },
    negotiation: { label: "Negotiation", color: "bg-orange-50 text-orange-600 border-orange-200" },
    won: { label: "WON", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    lost: { label: "LOST", color: "bg-red-50 text-red-500 border-red-200" },
    new_request: { label: "New Request", color: "bg-blue-50 text-blue-600 border-blue-200" },
    qualifying: { label: "Qualifying", color: "bg-amber-50 text-amber-600 border-amber-200" },
    awaiting_payment: { label: "Awaiting Payment", color: "bg-orange-50 text-orange-600 border-orange-200" },
};

// ─── Helpers (hoisted — pure function, no closure deps) ─────────────────────────

function formatPrice(price: number, currency: string): string {
    if (currency === "IDR") {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(price);
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PropertyInterestCardProps {
    property: PropertyInterestItem;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PropertyInterestCard({ property }: PropertyInterestCardProps) {
    const isSoldOrRented = property.status !== "available";
    const pipelineConfig = PIPELINE_CONFIG[property.pipelineStatus];

    return (
        <div
            className={cn(
                "flex items-start gap-4 px-6 py-4",
                isSoldOrRented && "opacity-65"
            )}
        >
            {/* Thumbnail */}
            <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border-base relative">
                <img
                    src={property.thumbnail}
                    alt={property.title}
                    className={cn("w-full h-full object-cover", isSoldOrRented && "grayscale")}
                />
                {isSoldOrRented && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest px-2 py-0.5 rounded border border-white/20">
                            {property.status === "sold" ? "Sold" : "Rented"}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex flex-col gap-1">
                        <p
                            className={cn(
                                "text-[14px] font-bold line-clamp-1",
                                isSoldOrRented ? "text-text-muted" : "text-text-primary"
                            )}
                        >
                            {property.title}
                        </p>
                        <p className="text-[12px] text-text-muted flex items-center gap-1.5">
                            <MapPin size={12} className="flex-shrink-0" />
                            {property.location}
                        </p>
                    </div>
                    <span
                        className={cn(
                            "flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
                            pipelineConfig.color
                        )}
                    >
                        {pipelineConfig.label}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[14px] font-extrabold text-text-primary">
                        {formatPrice(property.price, property.currency)}
                    </p>
                    <span className="text-border-base font-bold">·</span>
                    <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">
                        {property.listingType}
                    </span>
                </div>
            </div>
        </div>
    );
}
