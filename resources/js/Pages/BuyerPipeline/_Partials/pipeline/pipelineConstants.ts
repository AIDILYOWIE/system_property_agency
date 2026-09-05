// ─── Pipeline Constants ─────────────────────────────────────────────────────────
// Hoisted outside any component — never re-created on render.

import {
    type BuyerPipelineStatus,
    type StageConfig,
    type PipelineLead,
} from "./pipelineTypes";

// ─── Stage configuration ─────────────────────────────────────────────────────────

export const STAGE_ORDER: BuyerPipelineStatus[] = [
    "new_lead",
    "contacted",
    "viewing",
    "negotiation",
    "won",
    "lost",
];

export const STAGE_CONFIG: Record<BuyerPipelineStatus, StageConfig> = {
    new_lead: {
        status: "new_lead",
        label: "New Lead",
        color: "bg-blue-50",
        textColor: "text-blue-600",
        borderColor: "border-blue-200",
        columnBg: "bg-blue-50/60",
        dotColor: "bg-blue-500",
    },
    contacted: {
        status: "contacted",
        label: "Contacted",
        color: "bg-amber-50",
        textColor: "text-amber-600",
        borderColor: "border-amber-200",
        columnBg: "bg-amber-50/60",
        dotColor: "bg-amber-500",
    },
    viewing: {
        status: "viewing",
        label: "Viewing",
        color: "bg-violet-50",
        textColor: "text-violet-600",
        borderColor: "border-violet-200",
        columnBg: "bg-violet-50/60",
        dotColor: "bg-violet-500",
    },
    negotiation: {
        status: "negotiation",
        label: "Negotiation",
        color: "bg-orange-50",
        textColor: "text-orange-600",
        borderColor: "border-orange-200",
        columnBg: "bg-orange-50/60",
        dotColor: "bg-orange-500",
    },
    won: {
        status: "won",
        label: "WON",
        color: "bg-emerald-50",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-200",
        columnBg: "bg-emerald-50/60",
        dotColor: "bg-emerald-500",
    },
    lost: {
        status: "lost",
        label: "LOST",
        color: "bg-red-50",
        textColor: "text-red-500",
        borderColor: "border-red-200",
        columnBg: "bg-red-50/60",
        dotColor: "bg-red-500",
    },
};

// ─── Mock data ────────────────────────────────────────────────────────────────────

