"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Building2,
    Search,
    X,
    MapPin,
    ImageOff,
    Lock,
    Check,
} from "lucide-react";
import { Input } from "@/Components/ui/input";
import {
    type InventoryProperty,
    MOCK_PROPERTIES,
    STATUS_STYLES,
    formatPrice,
} from "./PropertyInterestRepeater";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PropertyPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (property: InventoryProperty) => void;
    selectedId: string | null;
    disabledIds: string[];
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PropertyPickerModal({
    open,
    onClose,
    onSelect,
    selectedId,
    disabledIds,
}: PropertyPickerModalProps) {
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setQuery("");
            setTimeout(() => searchRef.current?.focus(), 50);
        }
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

    if (!open) return null;

    const filtered = MOCK_PROPERTIES.filter(
        (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.location.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
    );

    return (
        /* Backdrop */
        <div
            ref={overlayRef}
            className="fixed inset-0 z-999999 flex items-center justify-center p-4"
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
                            Select Property
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            Choose a property from your inventory
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-canvas hover:text-text-primary transition-colors"
                        aria-label="Close picker"
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
                            placeholder="Search customers..."
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

                {/* Property List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center mb-3">
                                <Building2 size={20} className="text-text-muted" />
                            </div>
                            <p className="text-sm font-medium text-text-primary">No properties found</p>
                            <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map((property) => {
                                const isSelected = property.id === selectedId;
                                const isDisabled = disabledIds.includes(property.id);
                                return (
                                    <button
                                        key={property.id}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => {
                                            if (isDisabled) return;
                                            onSelect(property);
                                            onClose();
                                        }}
                                        className={cn(
                                            "group relative w-full text-left rounded-xl border transition-all duration-200 overflow-hidden",
                                            "focus:outline-none focus-visible:ring-0",
                                            isDisabled
                                                ? "border-border-base bg-white cursor-not-allowed opacity-75"
                                                : isSelected
                                                    ? "border-text-primary"
                                                    : "border-border-base bg-white hover:shadow-sm"
                                        )}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-full h-32 bg-canvas overflow-hidden">
                                            {property.thumbnail ? (
                                                <img
                                                    src={property.thumbnail}
                                                    alt={property.title}
                                                    className={cn(
                                                        "w-full h-full object-cover transition-transform duration-300",
                                                        !isDisabled && "group-hover:scale-105",
                                                        isDisabled && "grayscale"
                                                    )}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                    <ImageOff size={24} />
                                                </div>
                                            )}

                                            {/* Listing type badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-white text-text-primary">
                                                    {property.listingType}
                                                </span>
                                            </div>

                                            {/* Disabled overlay */}
                                            {isDisabled && (
                                                <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-1.5">
                                                    <div className="flex items-center gap-1.5 bg-white/90 border border-border-base rounded-full px-2.5 py-1 shadow-sm">
                                                        <Lock size={11} className="text-text-muted" />
                                                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                                                            Already selected
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Current-entry checkmark */}
                                            {isSelected && !isDisabled && (
                                                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                                    <Check size={14} className="text-primary drop-shadow-sm" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className={cn("p-3", isDisabled && "opacity-50")}>
                                            <p className="text-[13px] font-semibold text-text-primary">
                                                {property.title}
                                            </p>
                                            <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                                                <MapPin size={10} className="flex-shrink-0" />
                                                {property.location}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-[13px] font-bold text-text-primary">
                                                    {formatPrice(property.price, property.currency)}
                                                </p>
                                                {isDisabled ? (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-gray-100 text-gray-400 border-gray-200">
                                                        In use
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                                            STATUS_STYLES[property.status]
                                                        )}
                                                    >
                                                        {property.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border-base bg-canvas flex-shrink-0">
                    <p className="text-xs text-text-muted">
                        {filtered.length} propert{filtered.length !== 1 ? "ies" : "y"} found
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-border-base"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
