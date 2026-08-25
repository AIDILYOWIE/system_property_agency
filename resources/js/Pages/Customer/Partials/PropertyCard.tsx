"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, ChevronRight } from "lucide-react";
import { Field } from "@/Components/ui/field";
import { type PropertyInterest } from "./PropertyInterestRepeater";
import SelectedPropertyCard from "./SelectedPropertyCard";
import PropertyPickerModal from "./PropertyPickerModal";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PropertyCardProps {
    entry: PropertyInterest;
    index: number;
    total: number;
    disabledIds: string[];
    onChange: (id: string, patch: Partial<PropertyInterest>) => void;
    onRemove: (id: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PropertyCard({
    entry,
    index,
    total,
    disabledIds,
    onChange,
    onRemove,
}: PropertyCardProps) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const isOwner = entry.customerType === "property_owner";

    return (
        <>
            <div>
                <Field>
                    {entry.selectedProperty ? (
                        /* ── Selected state: show rich card ── */
                        <SelectedPropertyCard
                            property={entry.selectedProperty}
                            onClear={() => {
                                if (total > 1) {
                                    onRemove(entry.id);
                                } else {
                                    onChange(entry.id, { selectedProperty: null });
                                }
                            }}
                            onReplace={() => setPickerOpen(true)}
                        />
                    ) : (
                        /* ── Empty state: picker trigger button ── */
                        <button
                            type="button"
                            id={`prop-${entry.id}`}
                            onClick={() => setPickerOpen(true)}
                            className={cn(
                                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-dashed",
                                "text-sm text-text-muted bg-canvas",
                                "hover:border-text-primary/40 hover:text-text-primary hover:bg-text-primary/[0.02]",
                                "transition-all duration-200 group"
                            )}
                            aria-label="Select a property from inventory"
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-white border border-border-base flex items-center justify-center transition-colors flex-shrink-0">
                                    <Building2 size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
                                </span>
                                <span className="flex flex-col text-left">
                                    <span className="text-[13px] font-medium">
                                        {isOwner
                                            ? "Select property from inventory"
                                            : "Browse & select a property"}
                                    </span>
                                    <span className="text-[11px] text-text-muted font-normal">
                                        {isOwner
                                            ? "Choose the property this owner wants to list"
                                            : "Choose from your available inventory"}
                                    </span>
                                </span>
                            </span>
                            <ChevronRight
                                size={15}
                                className="text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0"
                            />
                        </button>
                    )}
                </Field>
            </div>

            {/* Property Picker Modal */}
            <PropertyPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(property) => onChange(entry.id, { selectedProperty: property })}
                selectedId={entry.selectedProperty?.id ?? null}
                disabledIds={disabledIds}
            />
        </>
    );
}
