import { useState, useMemo, useCallback, useEffect } from "react";
import { router } from "@inertiajs/react";
import { type PipelineItem, type PipelineStatus } from "./pipelineTypes";
// constants injected via options

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePipeline(
    initialLeads: PipelineItem[],
    stageOrder: string[],
    routePrefix: string,
) {
    const [leads, setLeads] = useState<PipelineItem[]>(initialLeads || []);

    // Sync if props change
    useEffect(() => {
        setLeads(initialLeads || []);
    }, [initialLeads]);

    const [activeStage, setActiveStage] = useState<PipelineStatus | "all">(
        "all",
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // ── Debounce Mechanism (300ms) ───────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ── Derived: searched leads (O(n) Single Source of Truth Filter) ─────────
    const searchedLeads = useMemo(() => {
        if (!debouncedQuery.trim()) return leads;

        const q = debouncedQuery.toLowerCase().trim();
        return leads.filter((l: any) => {
            return (
                // Buyer pipeline — customer details
                (l.name && l.name.toLowerCase().includes(q)) ||
                (l.phone && l.phone.includes(q)) ||
                (l.email && l.email.toLowerCase().includes(q)) ||
                (l.customerType && l.customerType.toLowerCase().includes(q)) ||
                // Buyer pipeline — property details
                (l.propertyName && l.propertyName.toLowerCase().includes(q)) ||
                (l.propertyLocation &&
                    l.propertyLocation.toLowerCase().includes(q)) ||
                (l.propertyPrice && l.propertyPrice.toString().includes(q)) ||
                // Property pipeline — property & seller fields
                (l.propertyTitle &&
                    l.propertyTitle.toLowerCase().includes(q)) ||
                (l.sellerName && l.sellerName.toLowerCase().includes(q)) ||
                (l.locationArea && l.locationArea.toLowerCase().includes(q)) ||
                (l.estimatedPrice && l.estimatedPrice.toString().includes(q))
            );
        });
    }, [leads, debouncedQuery]);

    // ── Derived: count per stage (O(n) single pass with Map) ─────────────────
    const countByStage = useMemo(() => {
        const map = new Map<PipelineStatus, number>();
        for (const stage of stageOrder) map.set(stage, 0);
        for (const lead of searchedLeads) {
            map.set(lead.status, (map.get(lead.status) ?? 0) + 1);
        }
        return map;
    }, [searchedLeads]);

    // ── Derived: leads grouped by stage for kanban ────────────────────────────
    const leadsByStage = useMemo(() => {
        const map = new Map<PipelineStatus, PipelineItem[]>();
        for (const stage of stageOrder) map.set(stage, []);
        for (const lead of searchedLeads) {
            map.get(lead.status)?.push(lead);
        }
        return map;
    }, [searchedLeads]);

    // ── Derived: filtered leads for the list view ─────────────────────────────
    const filteredLeads = useMemo(() => {
        return activeStage === "all"
            ? searchedLeads
            : (leadsByStage.get(activeStage) ?? []);
    }, [activeStage, searchedLeads, leadsByStage]);

    // ── Actions ───────────────────────────────────────────────────────────────

    // Manage which lead is currently prompting for a won/lost reason
    interface StatusModalTarget {
        leadId: string;
        status: PipelineStatus;
    }
    const [statusModalTarget, setStatusModalTarget] =
        useState<StatusModalTarget | null>(null);

    const handleStatusChange = useCallback(
        (leadId: string, newStatus: PipelineStatus, statusReason?: string) => {
            const requiresReason =
                newStatus === "lost" ||
                newStatus === "won" ||
                newStatus === "rejected" ||
                newStatus === "listed";

            if (requiresReason && !statusReason) {
                setStatusModalTarget({ leadId, status: newStatus });
                return; // halt and wait for modal submission
            }

            // If they are submitting the modal, we can close it immediately
            setStatusModalTarget(null);

            // Optimistic Update
            setLeads((prev) =>
                prev.map((lead) =>
                    lead.id === leadId ? { ...lead, status: newStatus } : lead,
                ),
            );

            router.patch(
                route(`${routePrefix}.status`, leadId),
                { status: newStatus, status_reason: statusReason },
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
        statusModalTarget,
        setStatusModalTarget,
    };
}
