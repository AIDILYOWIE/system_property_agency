"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Building2,
    Search,
    X,
    MapPin,
    ImageOff,
    Tag,
} from "lucide-react";
import { Input } from "@/Components/ui/input";
import { router } from "@inertiajs/react";
import { formatCurrency } from "@/lib/format";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UnassignedProperty {
    id: string;
    title: string;
    location: string;       // location_area from PropertyResource
    price: number | null;
    currency: "IDR" | "USD";
    category: string;
    listingType: "For Sale" | "For Rent";
    status: string;
    visibility: string;
    thumbnail: string;
}

// ─── Status / Listing badge styles ───────────────────────────────────────────

const LISTING_BADGE: Record<string, string> = {
    "For Sale": "bg-blue-50 text-blue-600 border-blue-100",
    "For Rent": "bg-purple-50 text-purple-600 border-purple-100",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface SellerPropertyPickerModalProps {
    open: boolean;
    sellerId: string;
    onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SellerPropertyPickerModal({
    open,
    sellerId,
    onClose,
}: SellerPropertyPickerModalProps) {
    const [properties, setProperties] = useState<UnassignedProperty[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Fetch unassigned properties when modal opens
    useEffect(() => {
        if (!open) return;
        setQuery("");
        setLoading(true);

        fetch(route("seller.properties.unassigned"))
            .then((res) => res.json())
            .then((data: UnassignedProperty[]) => {
                setProperties(data);
            })
            .catch(() => setProperties([]))
            .finally(() => {
                setLoading(false);
                setTimeout(() => searchRef.current?.focus(), 50);
            });
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const handleAssign = useCallback(
        (property: UnassignedProperty) => {
            router.patch(
                route("seller.property.assign", { seller: sellerId, property: property.id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => onClose(),
                }
            );
        },
        [sellerId, onClose]
    );

    if (!open) return null;

    const filtered = properties.filter((p) => {
        const q = query.toLowerCase();
        return (
            p.title.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    });

    return (
        /* Backdrop */
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            {/* Modal Panel */}
            <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-border-base flex flex-col overflow-hidden"
                style={{ maxHeight: "80vh" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-base flex-shrink-0">
                    <div>
                        <h3 className="text-[15px] font-semibold text-text-primary">
                            Tautkan Properti
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            Pilih properti draft yang belum memiliki seller
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-canvas hover:text-text-primary transition-colors"
                        aria-label="Tutup picker"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-border-base flex-shrink-0">
                    <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <Input
                            ref={searchRef}
                            type="text"
                            placeholder="Cari properti berdasarkan nama, lokasi, atau kategori..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full !bg-white border border-border-base rounded-lg py-3 pl-10 pr-4 text-sm focus:border-border-base transition-colors text-text-primary h-auto"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Property Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
                            <p className="text-sm text-text-muted">Memuat properti...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center mb-3">
                                <Building2 size={20} className="text-text-muted" />
                            </div>
                            <p className="text-sm font-medium text-text-primary">
                                {query ? "Tidak ada properti ditemukan" : "Tidak ada properti tanpa seller"}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                {query
                                    ? "Coba kata kunci lain"
                                    : "Semua properti sudah memiliki seller yang tautkan"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map((property) => (
                                <button
                                    key={property.id}
                                    type="button"
                                    onClick={() => handleAssign(property)}
                                    className={cn(
                                        "group relative w-full text-left rounded-xl border transition-all duration-200 overflow-hidden",
                                        "focus:outline-none focus-visible:ring-0",
                                        "border-border-base bg-white hover:shadow-md hover:border-primary/30"
                                    )}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-full h-32 bg-canvas overflow-hidden">
                                        {property.thumbnail &&
                                            !property.thumbnail.includes("placehold.co") ? (
                                            <img
                                                src={property.thumbnail}
                                                alt={property.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                <ImageOff size={24} />
                                            </div>
                                        )}

                                        {/* Listing type badge */}
                                        <div className="absolute top-2 left-2">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                                    LISTING_BADGE[property.listingType] ??
                                                    "bg-white text-text-primary border-border-base"
                                                )}
                                            >
                                                {property.listingType}
                                            </span>
                                        </div>

                                        {/* Draft badge */}
                                        {property.visibility === "draft" && (
                                            <div className="absolute top-2 right-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-200">
                                                    Draft
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="text-[13px] font-semibold text-text-primary line-clamp-1">
                                            {property.title}
                                        </p>
                                        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                                            <MapPin size={10} className="flex-shrink-0" />
                                            {property.location || "-"}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-[13px] font-bold text-text-primary">
                                                {property.price
                                                    ? formatCurrency(property.price, property.currency)
                                                    : "—"}
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted">
                                                <Tag size={10} />
                                                {property.category}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border-base bg-canvas flex-shrink-0">
                    <p className="text-xs text-text-muted">
                        {loading
                            ? "Memuat..."
                            : `${filtered.length} propert${filtered.length !== 1 ? "i" : "i"} tersedia`}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-border-base"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
