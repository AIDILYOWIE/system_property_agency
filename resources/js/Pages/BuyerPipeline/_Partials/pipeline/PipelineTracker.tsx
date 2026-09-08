import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { type PipelineStatus, type CustomerType } from "../../../Customer/_Partials/CustomerColumn";

// ─── Stage Config (hoisted — never re-created on render) ───────────────────────

const BUYER_STAGES: { status: PipelineStatus; label: string }[] = [
    { status: "new_lead", label: "New Lead" },
    { status: "contacted", label: "Contacted" },
    { status: "viewing", label: "Viewing" },
    { status: "negotiation", label: "Negotiation" },
    { status: "won", label: "WON" },
];

const OWNER_STAGES: { status: PipelineStatus; label: string }[] = [
    { status: "new_request", label: "New Request" },
    { status: "qualifying", label: "Qualifying" },
    { status: "awaiting_payment", label: "Awaiting Payment" },
    { status: "won", label: "WON" },
];

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineTrackerProps {
    customerType: CustomerType;
    currentStatus: PipelineStatus;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PipelineTracker({
    customerType,
    currentStatus,
}: PipelineTrackerProps) {
    const stages = customerType === "property_owner" ? OWNER_STAGES : BUYER_STAGES;
    const isLost = currentStatus === "lost";
    const currentIdx = stages.findIndex((s) => s.status === currentStatus);

    return (
        <div className="flex flex-wrap items-center gap-y-2">
            {isLost ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
                    <XCircle size={14} className="text-red-500" />
                    <span className="text-[12px] font-bold text-red-600">LOST</span>
                </div>
            ) : (
                stages.map((stage, idx) => {
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                        <div key={stage.status} className="flex items-center">
                            <div
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border",
                                    isDone
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                        : isCurrent
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "bg-canvas text-text-muted border-border-base"
                                )}
                            >
                                {isDone ? (
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                ) : isCurrent ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                ) : null}
                                {stage.label}
                            </div>
                            {idx < stages.length - 1 && (
                                <ChevronRight
                                    size={14}
                                    className={cn(
                                        "mx-1 flex-shrink-0",
                                        idx < currentIdx ? "text-emerald-400" : "text-border-base"
                                    )}
                                />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
