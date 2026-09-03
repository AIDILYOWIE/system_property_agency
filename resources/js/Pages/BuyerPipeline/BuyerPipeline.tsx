import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link } from "@inertiajs/react";
import { UserPlus, Search, X, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { usePipelineLeads } from "./_Partials/pipeline/usePipelineLeads";
import PipelineStageBar from "./_Partials/pipeline/PipelineStageBar";
import PipelineKanbanBoard from "./_Partials/pipeline/PipelineKanbanBoard";
import PipelineLeadList from "./_Partials/pipeline/PipelineLeadList";
import { Input } from "@/Components/ui/input";

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BuyerPipeline({ leads: initialLeads }: { leads: any[] }) {
    const {
        leads,
        filteredLeads,
        leadsByStage,
        countByStage,
        activeStage,
        setActiveStage,
        searchQuery,
        setSearchQuery,
        handleStatusChange,
    } = usePipelineLeads(initialLeads);

    // View mode — "list" default on all screens; kanban only shown on lg+ via CSS
    const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

    const isKanbanMode = viewMode === "kanban";

    return (
        <DashboardLayout
            pageTitle="Buyer Pipeline"
            pageDescription="Track and manage all buyer & renter leads through the sales pipeline."
            action={
                <Link href="/customer/add" className="btn btn-primary flex items-center gap-2">
                    <UserPlus size={15} strokeWidth={2.5} />
                    Add Lead
                </Link>
            }
        >
            <div className="flex flex-col gap-5">

                {/* ── Toolbar ──────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-border-base px-5 py-4 flex flex-col gap-4">

                    {/* Top row: Stage filter tabs + View toggle */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="lg:hidden flex-1 min-w-0">
                            <PipelineStageBar
                                activeStage={activeStage}
                                countByStage={countByStage}
                                totalCount={leads.length}
                                onChange={setActiveStage}
                            />
                        </div>

                        {/* Bottom row: Search */}

                        <div className="relative w-72 flex-shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full !bg-white border border-border-base rounded-lg py-3 pl-10 pr-4 text-sm focus:border-border-base transition-colors text-text-primary h-auto"
                            />
                        </div>

                        {/* View mode toggle — only visible on lg+ since kanban only works on lg+ */}
                        <div className="hidden lg:flex items-center gap-1 bg-canvas rounded-lg p-1 border border-border-base flex-shrink-0 ml-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode("kanban")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150",
                                    isKanbanMode
                                        ? "bg-white text-text-primary shadow-sm border border-border-base"
                                        : "text-text-muted hover:text-text-primary"
                                )}
                            >
                                <LayoutGrid size={13} />
                                Board
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150",
                                    !isKanbanMode
                                        ? "bg-white text-text-primary shadow-sm border border-border-base"
                                        : "text-text-muted hover:text-text-primary"
                                )}
                            >
                                <List size={13} />
                                List
                            </button>
                        </div>
                    </div>


                </div>

                {/* ── Kanban Board (desktop, lg+, only in kanban mode) ────── */}
                {isKanbanMode && (
                    <div className="hidden lg:block">
                        {/* Fixed height kanban — scrollable columns */}
                        <div style={{ height: "calc(100vh - 280px)", minHeight: "480px" }}>
                            <PipelineKanbanBoard
                                leadsByStage={leadsByStage}
                                onStatusChange={handleStatusChange}
                            />
                        </div>
                    </div>
                )}

                {/* ── List View (always shown on mobile; shown on lg+ when in list mode) ── */}
                <div className={cn(isKanbanMode ? "lg:hidden" : "")}>
                    <PipelineLeadList
                        leads={filteredLeads}
                        onStatusChange={handleStatusChange}
                    />
                </div>

            </div>
        </DashboardLayout>
    );
}
