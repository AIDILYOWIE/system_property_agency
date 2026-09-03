import { useState, useMemo, useCallback, useEffect } from "react";
import { router } from "@inertiajs/react";
import { type PipelineLead, type BuyerPipelineStatus } from "./pipelineTypes";
import { STAGE_ORDER } from "./pipelineConstants";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePipelineLeads(initialLeads: PipelineLead[]) {
    const [leads, setLeads] = useState<PipelineLead[]>(initialLeads || []);

    // Sync if props change
    useEffect(() => {
        setLeads(initialLeads || []);
    }, [initialLeads]);

    const [activeStage, setActiveStage] = useState<BuyerPipelineStatus | "all">(
        "all",
    );
    const [searchQuery, setSearchQuery] = useState("");

    // ── Derived: count per stage (O(n) single pass with Map) ─────────────────
    const countByStage = useMemo(() => {
        const map = new Map<BuyerPipelineStatus, number>();
        for (const stage of STAGE_ORDER) map.set(stage, 0);
        for (const lead of leads) {
            map.set(lead.status, (map.get(lead.status) ?? 0) + 1);
        }
        return map;
    }, [leads]);

    // ── Derived: leads grouped by stage for kanban ────────────────────────────
    const leadsByStage = useMemo(() => {
        const map = new Map<BuyerPipelineStatus, PipelineLead[]>();
        for (const stage of STAGE_ORDER) map.set(stage, []);
        for (const lead of leads) {
            map.get(lead.status)?.push(lead);
        }
        return map;
    }, [leads]);

    // ── Derived: filtered leads for the list view ─────────────────────────────
    const filteredLeads = useMemo(() => {
        let result =
            activeStage === "all"
                ? leads
                : (leadsByStage.get(activeStage) ?? []);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (l) =>
                    l.name.toLowerCase().includes(q) ||
                    l.propertyName.toLowerCase().includes(q) ||
                    l.phone.includes(q),
            );
        }
        return result;
    }, [leads, activeStage, leadsByStage, searchQuery]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleStatusChange = useCallback(
        (leadId: string, newStatus: BuyerPipelineStatus) => {
            // Optimistic Update
            setLeads((prev) =>
                prev.map((lead) =>
                    lead.id === leadId ? { ...lead, status: newStatus } : lead,
                ),
            );

            // Real-time backend sync without page load
            router.patch(
                route("buyer-pipeline.status", leadId),
                { status: newStatus },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => {
                        // Revert UI if error occurs (could trigger a toast here if desired)
                        setLeads(initialLeads || []);
                    },
                },
            );
        },
        [initialLeads],
    );

    return {
        leads,
        filteredLeads,
        leadsByStage,
        countByStage,
        activeStage,
        setActiveStage,
        searchQuery,
        setSearchQuery,
        handleStatusChange,
    };
}
