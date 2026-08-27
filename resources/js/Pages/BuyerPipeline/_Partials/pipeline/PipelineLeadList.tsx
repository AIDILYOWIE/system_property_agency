import { Users } from "lucide-react";
import { type PipelineLead, type BuyerPipelineStatus } from "./pipelineTypes";
import PipelineLeadCard from "./PipelineLeadCard";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PipelineLeadListProps {
    leads: PipelineLead[];
    onStatusChange: (leadId: string, newStatus: BuyerPipelineStatus) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────
// Mobile-first vertical list. Shown on all screens below lg.

export default function PipelineLeadList({
    leads,
    onStatusChange,
}: PipelineLeadListProps) {
    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-border-base">
                <div className="w-12 h-12 rounded-full bg-canvas border border-border-base flex items-center justify-center mb-3">
                    <Users size={20} className="text-text-muted" />
                </div>
                <p className="text-[14px] font-semibold text-text-primary">No leads found</p>
                <p className="text-[12px] text-text-muted mt-1">
                    Try a different filter or search term
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-border-base overflow-hidden">
            <div className="divide-y divide-border-base">
                {leads.map((lead) => (
                    <PipelineLeadCard
                        key={lead.id}
                        lead={lead}
                        onStatusChange={onStatusChange}
                        variant="full"
                    />
                ))}
            </div>
        </div>
    );
}
