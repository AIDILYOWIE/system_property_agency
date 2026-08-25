"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, AlertCircle } from "lucide-react";
import PropertyCard from "./PropertyCard";

// ─── Inventory Property Type ────────────────────────────────────────────────────

export interface InventoryProperty {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: "IDR" | "USD";
    category: string;
    listingType: "For Sale" | "For Rent";
    status: "available" | "sold" | "rented" | "draft";
    thumbnail: string;
}

// ─── Shared Mock Data ───────────────────────────────────────────────────────────

export const MOCK_PROPERTIES: InventoryProperty[] = [
    {
        id: "prop-1",
        title: "Modern Villa Ubud",
        location: "Ubud, Bali",
        price: 850000,
        currency: "USD",
        category: "Villa",
        listingType: "For Sale",
        status: "available",
        thumbnail:
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        id: "prop-2",
        title: "Minimalist Villa Canggu",
        location: "Canggu, Bali",
        price: 35000,
        currency: "USD",
        category: "Villa",
        listingType: "For Rent",
        status: "available",
        thumbnail:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        id: "prop-3",
        title: "Beachfront Premium House",
        location: "Seminyak, Bali",
        price: 2100000,
        currency: "USD",
        category: "Premium House",
        listingType: "For Sale",
        status: "sold",
        thumbnail:
            "https://images.unsplash.com/photo-1613490908592-fd5a12130325?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        id: "prop-4",
        title: "Tropical Garden Townhouse",
        location: "Kerobokan, Bali",
        price: 420000,
        currency: "USD",
        category: "Villa",
        listingType: "For Sale",
        status: "available",
        thumbnail:
            "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        id: "prop-5",
        title: "Strategic Commercial Land",
        location: "Kuta, Bali",
        price: 980000000,
        currency: "IDR",
        category: "Land",
        listingType: "For Sale",
        status: "available",
        thumbnail:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        id: "prop-6",
        title: "Luxury Clifftop Villa",
        location: "Uluwatu, Bali",
        price: 3200000,
        currency: "USD",
        category: "Villa",
        listingType: "For Sale",
        status: "available",
        thumbnail:
            "https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
];

// ─── Shared Helpers ─────────────────────────────────────────────────────────────

function generateId() {
    return Math.random().toString(36).slice(2, 9);
}

export function formatPrice(price: number, currency: string): string {
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

// ─── Status Styles (shared by PropertyPickerModal) ──────────────────────────────

export const STATUS_STYLES: Record<InventoryProperty["status"], string> = {
    available: "bg-emerald-50 text-emerald-600 border-emerald-200",
    sold: "bg-red-50 text-red-500 border-red-100",
    rented: "bg-violet-50 text-violet-600 border-violet-200",
    draft: "bg-gray-100 text-gray-500 border-gray-200",
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CustomerType = "buyer" | "renter" | "property_owner";
export type ListingType = "for_sale" | "for_rent";
export type OpenSlotTier = "open_slot_1" | "open_slot_2" | "open_slot_3" | "";

export interface PropertyInterest {
    id: string;
    customerType: CustomerType;
    selectedProperty: InventoryProperty | null;
    listingType: ListingType;
    openSlotTier: OpenSlotTier;
    pipelineStatus: "new_lead" | "new_request";
}

function defaultEntry(): PropertyInterest {
    return {
        id: generateId(),
        customerType: "buyer",
        selectedProperty: null,
        listingType: "for_sale",
        openSlotTier: "",
        pipelineStatus: "new_lead",
    };
}

// ─── Main Repeater ─────────────────────────────────────────────────────────────

export interface PropertyInterestRepeaterProps {
    value: PropertyInterest[];
    onChange: (entries: PropertyInterest[]) => void;
    maxEntries?: number;
}

export default function PropertyInterestRepeater({
    value,
    onChange,
    maxEntries = 5,
}: PropertyInterestRepeaterProps) {
    function handleAdd() {
        if (value.length >= maxEntries) return;
        onChange([...value, defaultEntry()]);
    }

    function handleChange(id: string, patch: Partial<PropertyInterest>) {
        onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    }

    function handleRemove(id: string) {
        if (value.length <= 1) return;
        onChange(value.filter((e) => e.id !== id));
    }

    const hasOwner = value.some((e) => e.customerType === "property_owner");
    const hasBuyer = value.some((e) => e.customerType !== "property_owner");

    // All selected property IDs across all entries (for exclusive-selection logic)
    const allSelectedIds = useMemo(
        () =>
            value
                .map((e) => e.selectedProperty?.id)
                .filter((id): id is string => Boolean(id)),
        [value]
    );

    return (
        <div className="flex flex-col gap-3">
            {/* ── Mixed pipeline info banner ─────────────────────── */}
            {hasOwner && hasBuyer && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 mb-1">
                    <AlertCircle size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                        Mixed pipeline detected. Each entry will be auto-routed to its corresponding
                        pipeline — <strong>Buyer/Renter Pipeline</strong> or{" "}
                        <strong>Open Slot Partners Pipeline</strong>.
                    </p>
                </div>
            )}

            {/* ── Entry cards ────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                {value.map((entry, index) => {
                    // Disabled IDs = all selected globally, minus this entry's own selection
                    const disabledIds = allSelectedIds.filter(
                        (id) => id !== entry.selectedProperty?.id
                    );
                    return (
                        <PropertyCard
                            key={entry.id}
                            entry={entry}
                            index={index}
                            total={value.length}
                            disabledIds={disabledIds}
                            onChange={handleChange}
                            onRemove={handleRemove}
                        />
                    );
                })}
            </div>

            {/* ── Add another button ─────────────────────────────── */}
            {value.length < maxEntries && (
                <button
                    type="button"
                    onClick={handleAdd}
                    className={cn(
                        "group w-full flex items-center justify-center gap-2",
                        "py-3 rounded-xl border-2 border-dashed border-border-base",
                        "text-sm font-medium text-text-muted",
                        "hover:border-text-primary hover:text-text-primary hover:bg-text-primary/5",
                        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    )}
                    aria-label="Add another property interest"
                >
                    <Plus
                        size={15}
                        className="group-hover:scale-110 transition-transform duration-150"
                    />
                    Add Another Property
                    <span className="text-xs text-text-muted/60 font-normal">
                        ({value.length}/{maxEntries})
                    </span>
                </button>
            )}

            {/* ── Max reached notice ─────────────────────────────── */}
            {value.length >= maxEntries && (
                <p className="text-center text-[11px] text-text-muted py-1">
                    Maximum of {maxEntries} property interests reached.
                </p>
            )}
        </div>
    );
}

// ─── Export factory for parent use ────────────────────────────────────────────
export { defaultEntry };
