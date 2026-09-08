"use client";

import { X, MapPin, ImageOff } from "lucide-react";
import { type InventoryProperty, formatPrice } from "./PropertyInterestRepeater";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface SelectedPropertyCardProps {
    property: InventoryProperty;
    onClear: () => void;
    onReplace: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function SelectedPropertyCard({
    property,
    onClear,
    onReplace,
}: SelectedPropertyCardProps) {
    return (
        <div className="relative flex items-start gap-3 p-3 rounded-xl border border-text-primary/25 bg-text-primary/[0.02] group">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border-base/60">
                {property.thumbnail ? (
                    <img
                        src={property.thumbnail}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-canvas flex items-center justify-center text-text-muted">
                        <ImageOff size={16} />
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text-primary line-clamp-1">
                    {property.title}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                    <MapPin size={10} className="flex-shrink-0" />
                    {property.location}
                </p>
                <p className="text-[13px] font-bold text-text-primary">
                    {formatPrice(property.price, property.currency)}
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <button
                    type="button"
                    onClick={onClear}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Remove property"
                    aria-label="Remove selected property"
                >
                    <X size={13} />
                </button>
                <button
                    type="button"
                    onClick={onReplace}
                    className="text-[10px] font-medium text-primary/80 hover:text-primary underline underline-offset-2 transition-colors"
                    aria-label="Change property"
                >
                    Change
                </button>
            </div>
        </div>
    );
}
