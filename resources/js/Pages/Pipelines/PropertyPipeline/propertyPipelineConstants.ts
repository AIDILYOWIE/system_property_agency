// ─── Property Pipeline Constants ─────────────────────────────────────────────
// Stage config for the Seller Supply pipeline (US 4.4).
// Hoisted outside any component — never re-created on render.

import { type StageConfig } from "../_Partials/pipeline/pipelineTypes";

export const PROPERTY_STAGE_ORDER: string[] = [
    "incoming",
    "surveyed",
    "agreed",
    "listed",
    "rejected",
];

export const PROPERTY_STAGE_CONFIG: Record<string, StageConfig> = {
    incoming: {
        status: "incoming",
        label: "Incoming",
        color: "bg-slate-50",
        textColor: "text-slate-600",
        borderColor: "border-slate-200",
        dotColor: "bg-slate-400",
    },
    surveyed: {
        status: "surveyed",
        label: "Surveyed",
        color: "bg-sky-50",
        textColor: "text-sky-700",
        borderColor: "border-sky-200",
        dotColor: "bg-sky-500",
    },
    agreed: {
        status: "agreed",
        label: "Agreed",
        color: "bg-violet-50",
        textColor: "text-violet-700",
        borderColor: "border-violet-200",
        dotColor: "bg-violet-500",
    },
    listed: {
        status: "listed",
        label: "Listed",
        color: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        dotColor: "bg-emerald-500",
    },
    rejected: {
        status: "rejected",
        label: "Rejected",
        color: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        dotColor: "bg-red-500",
    },
};
