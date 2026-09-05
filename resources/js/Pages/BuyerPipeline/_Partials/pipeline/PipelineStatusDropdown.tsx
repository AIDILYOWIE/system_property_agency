import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { STAGE_ORDER, STAGE_CONFIG } from "./pipelineConstants";
import { type BuyerPipelineStatus } from "./pipelineTypes";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineStatusDropdownProps {
    leadId: string;
    currentStatus: BuyerPipelineStatus;
    onChange: (leadId: string, newStatus: BuyerPipelineStatus) => void;
    disabled?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PipelineStatusDropdown({
    leadId,
    currentStatus,
    onChange,
    disabled = false,
}: PipelineStatusDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const cfg = STAGE_CONFIG[currentStatus];

    // Close on outside click — stable handler via ref
    const handleOutsideClick = useCallback((e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setOpen(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open, handleOutsideClick]);

    const handleSelect = useCallback(
        (status: BuyerPipelineStatus) => {
            onChange(leadId, status);
            setOpen(false);
        },
        [leadId, onChange]
    );

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) setOpen((prev) => !prev);
                }}
                className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-150",
                    !disabled && "cursor-pointer hover:opacity-80",
                    disabled && "opacity-70 cursor-not-allowed",
                    cfg.color,
                    cfg.textColor,
                    cfg.borderColor
                )}
            >
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dotColor)} />
                {cfg.label}
                {!disabled && (
                    <ChevronDown
                        size={10}
                        className={cn("transition-transform duration-150", open && "rotate-180")}
                    />
                )}
            </button>

            {open && !disabled && (
                <div className="absolute left-0 top-full mt-1.5 z-[9999] w-44 bg-white rounded-xl border border-border-base shadow-lg py-1 overflow-hidden">
                    {STAGE_ORDER.map((stage) => {
                        const stageCfg = STAGE_CONFIG[stage];
                        const isCurrent = stage === currentStatus;
                        return (
                            <button
                                key={stage}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(stage);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-left transition-colors",
                                    isCurrent
                                        ? "bg-canvas text-text-primary font-semibold"
                                        : "text-text-muted hover:bg-canvas hover:text-text-primary"
                                )}
                            >
                                <span
                                    className={cn(
                                        "w-2 h-2 rounded-full flex-shrink-0",
                                        stageCfg.dotColor
                                    )}
                                />
                                {stageCfg.label}
                                {isCurrent && (
                                    <CheckCircle2 size={12} className="ml-auto text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
