import { Check, X, MessageCircle } from "lucide-react";
import { type PropertyInterestItem } from "@/Components/PropertyInterestCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WAPopupModalProps {
    open: boolean;
    onClose: () => void;
    properties: PropertyInterestItem[];
    onProceed: (selectedPropertyIds: string[]) => void;
}

export default function WAPopupModal({ open, onClose, properties, onProceed }: WAPopupModalProps) {
    // Determine which properties are valid for follow up (e.g. not lost)
    const validProperties = properties.filter(p => p.pipelineStatus !== "lost" && p.pipelineStatus !== "won");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(validProperties.map(p => p.id)));

    if (!open) return null;

    const toggleProperty = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleProceed = () => {
        if (selectedIds.size === 0) return;
        onProceed(Array.from(selectedIds));
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-base bg-[#F8FAFC]">
                    <h3 className="text-[15px] font-bold text-text-primary flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-text-primary" />
                        Follow Up WhatsApp
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-md text-text-muted transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5">

                    {validProperties.length === 0 ? (
                        <div className="text-center py-6 bg-canvas rounded-xl mb-4">
                            <p className="text-sm font-medium text-text-muted">Tidak ada properti aktif</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 mb-6">
                            {validProperties.map(property => {
                                const isSelected = selectedIds.has(property.id);
                                return (
                                    <label
                                        key={property.id}
                                        className={cn(
                                            "flex items-start justify-between gap-3 p-3 border rounded-xl cursor-pointer transition-colors group",
                                            isSelected
                                                ? "border-text-primary bg-text-primary-50/50"
                                                : "border-border-base bg-white"
                                        )}
                                        onClick={() => toggleProperty(property.id)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className={cn(
                                                "w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-border-base text-transparent"
                                            )}>
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                                <p className="text-[13px] font-semibold text-text-primary truncate">{property.title}</p>
                                                
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    <button
                        onClick={handleProceed}
                        disabled={selectedIds.size === 0}
                        className={cn(
                            "btn w-full justify-center transition-all",
                            selectedIds.size > 0
                                ? "btn-primary"
                                : "bg-canvas text-text-muted cursor-not-allowed"
                        )}
                    >
                        <MessageCircle size={16} />
                        Lanjutkan
                    </button>
                    <p className="text-[10px] text-center text-text-muted mt-3">
                        Status properti yang dipilih akan otomatis berubah menjadi "Contacted".
                    </p>
                </div>
            </div>
        </>
    );
}
