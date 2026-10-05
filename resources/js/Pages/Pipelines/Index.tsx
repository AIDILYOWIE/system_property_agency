import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, router } from "@inertiajs/react";
import { UserPlus, Building2, Search, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/Components/ui/input";

// Buyer Components
import { usePipeline as useBuyerPipeline } from "./_Partials/pipeline/usePipeline";
import { STAGE_ORDER as BUYER_STAGE_ORDER, STAGE_CONFIG as BUYER_STAGE_CONFIG } from "./_Partials/pipeline/pipelineConstants";
import { BuyerCard } from "./BuyerPipeline/Components/BuyerCard";

// Property Components
import { usePipeline as usePropertyPipeline } from "./_Partials/pipeline/usePipeline";
import { PROPERTY_STAGE_ORDER, PROPERTY_STAGE_CONFIG } from "./PropertyPipeline/propertyPipelineConstants";
import { PropertyCard } from "./PropertyPipeline/Components/PropertyCard";

// Shared Components
import PipelineStageBar from "./_Partials/pipeline/PipelineStageBar";
import PipelineKanbanBoard from "./_Partials/pipeline/PipelineKanbanBoard";
import PipelineList from "./_Partials/pipeline/PipelineList";
import StatusReasonModal from "./_Partials/pipeline/StatusReasonModal";

// ─── Segmented Control Component ──────────────────────────────────────────────
function PipelineTabControl({ activeTab }: { activeTab: "buyer" | "property" }) {
    const handleSwitch = (tab: "buyer" | "property") => {
        if (tab === activeTab) return;

        router.get(
            route("pipelines.index"),
            { tab },
            {
                only: ["buyerLeads", "propertyLeads", "activeTab"],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <div className="flex items-center p-1 bg-canvas border border-border-base rounded-lg w-fit flex-shrink-0 shadow-sm">
            <button
                onClick={() => handleSwitch("buyer")}
                className={cn(
                    "px-4 py-2 rounded-md text-[13px] font-semibold transition-all duration-200",
                    activeTab === "buyer"
                        ? "bg-white text-text-primary shadow-sm border border-border-base"
                        : "text-text-muted hover:text-text-primary"
                )}
            >
                Customer
            </button>
            <button
                onClick={() => handleSwitch("property")}
                className={cn(
                    "px-4 py-2 rounded-md text-[13px] font-semibold transition-all duration-200",
                    activeTab === "property"
                        ? "bg-white text-text-primary shadow-sm border border-border-base"
                        : "text-text-muted hover:text-text-primary"
                )}
            >
                Property
            </button>
        </div>
    );
}

// ─── Buyer Board Component ──────────────────────────────────────────────────
function BuyerBoard({ leads }: { leads: any[] }) {
    const {
        leads: data,
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
    } = useBuyerPipeline(leads || [], BUYER_STAGE_ORDER, "buyer-pipeline");

    const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
    const isKanbanMode = viewMode === "kanban";

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Top segment: Stage filter tabs (mobile only) */}
                    <div className="lg:hidden flex-1 min-w-0 w-full">
                        <PipelineStageBar
                            activeStage={activeStage}
                            countByStage={countByStage}
                            totalCount={data.length}
                            stageOrder={BUYER_STAGE_ORDER}
                            stageConfigs={BUYER_STAGE_CONFIG}
                            onChange={setActiveStage}
                        />
                    </div>

                    {/* Left side: Search & Tab Control */}
                    <div className="flex items-center gap-3 w-full lg:w-full lg:justify-between overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
                        <div className="relative w-full sm:w-[350px] flex-shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                                type="text"
                                placeholder="Search customers, properties, price..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full !bg-white border border-border-base rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-border-base transition-colors text-text-primary h-auto"
                            />
                        </div>
                        <PipelineTabControl activeTab="buyer" />
                    </div>

                </div>
            </div>

            {/* Kanban Board */}
            {isKanbanMode && (
                <div className="hidden lg:block">
                    <div style={{ height: "calc(100vh - 280px)", minHeight: "480px" }}>
                        <PipelineKanbanBoard
                            itemsByStage={leadsByStage}
                            stageOrder={BUYER_STAGE_ORDER}
                            stageConfigs={BUYER_STAGE_CONFIG}
                            onStatusChange={handleStatusChange}
                            dndType="BUYER_PIPELINE"
                            renderCard={(item, isDragging, variant, isShadow) => (
                                <BuyerCard
                                    lead={item}
                                    isDragging={isDragging}
                                    variant={variant}
                                    isShadow={isShadow}
                                    onStatusChange={handleStatusChange}
                                    stageOrder={BUYER_STAGE_ORDER}
                                    stageConfigs={BUYER_STAGE_CONFIG}
                                />
                            )}
                        />
                    </div>
                </div>
            )}

            {/* List View */}
            <div className={cn(isKanbanMode ? "lg:hidden" : "")}>
                <PipelineList
                    items={filteredLeads}
                    stageConfigs={BUYER_STAGE_CONFIG}
                    onStatusChange={handleStatusChange}
                    renderCard={(item, isDragging, variant, isShadow) => (
                        <BuyerCard
                            lead={item}
                            isDragging={isDragging}
                            variant={variant}
                            isShadow={isShadow}
                            onStatusChange={handleStatusChange}
                            stageOrder={BUYER_STAGE_ORDER}
                            stageConfigs={BUYER_STAGE_CONFIG}
                        />
                    )}
                />
            </div>

            <StatusReasonModal
                show={!!statusModalTarget}
                leadId={statusModalTarget?.leadId || null}
                status={statusModalTarget?.status || null}
                onClose={() => setStatusModalTarget(null)}
                onSubmit={handleStatusChange}
                pipelineType="buyer"
            />
        </div>
    );
}

// ─── Property Board Component ───────────────────────────────────────────────
function PropertyBoard({ properties }: { properties: any[] }) {
    const {
        leads: data,
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
    } = usePropertyPipeline(properties || [], PROPERTY_STAGE_ORDER, "property-pipeline");

    const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
    const isKanbanMode = viewMode === "kanban";

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Stage filter tabs (mobile only) */}
                    <div className="lg:hidden flex-1 min-w-0 w-full">
                        <PipelineStageBar
                            activeStage={activeStage}
                            countByStage={countByStage}
                            totalCount={data.length}
                            stageOrder={PROPERTY_STAGE_ORDER}
                            stageConfigs={PROPERTY_STAGE_CONFIG}
                            onChange={setActiveStage}
                        />
                    </div>

                    {/* Left side: Search & Tab Control */}
                    <div className="flex items-center gap-3 w-full lg:w-full overflow-x-auto justify-between pb-1 lg:pb-0 hide-scrollbar">
                        <div className="relative w-full sm:w-[350px] flex-shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                                type="text"
                                placeholder="Search properties, sellers, location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full !bg-white border border-border-base rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-border-base transition-colors text-text-primary h-auto"
                            />
                        </div>
                        <PipelineTabControl activeTab="property" />
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            {isKanbanMode && (
                <div className="hidden lg:block">
                    <div style={{ height: "calc(100vh - 280px)", minHeight: "480px" }}>
                        <PipelineKanbanBoard
                            itemsByStage={leadsByStage}
                            stageOrder={PROPERTY_STAGE_ORDER}
                            stageConfigs={PROPERTY_STAGE_CONFIG}
                            onStatusChange={handleStatusChange}
                            dndType="PROPERTY_PIPELINE"
                            renderCard={(item, isDragging, variant, isShadow) => (
                                <PropertyCard
                                    lead={item}
                                    isDragging={isDragging}
                                    variant={variant}
                                    isShadow={isShadow}
                                    onStatusChange={handleStatusChange}
                                    stageOrder={PROPERTY_STAGE_ORDER}
                                    stageConfigs={PROPERTY_STAGE_CONFIG}
                                />
                            )}
                        />
                    </div>
                </div>
            )}

            {/* List View */}
            <div className={cn(isKanbanMode ? "lg:hidden" : "")}>
                <PipelineList
                    items={filteredLeads}
                    stageConfigs={PROPERTY_STAGE_CONFIG}
                    onStatusChange={handleStatusChange}
                    renderCard={(item, isDragging, variant, isShadow) => (
                        <PropertyCard
                            lead={item}
                            isDragging={isDragging}
                            variant={variant}
                            isShadow={isShadow}
                            onStatusChange={handleStatusChange}
                            stageOrder={PROPERTY_STAGE_ORDER}
                            stageConfigs={PROPERTY_STAGE_CONFIG}
                        />
                    )}
                />
            </div>

            <StatusReasonModal
                show={!!statusModalTarget}
                leadId={statusModalTarget?.leadId || null}
                status={statusModalTarget?.status || null}
                onClose={() => setStatusModalTarget(null)}
                onSubmit={handleStatusChange}
                pipelineType="property"
            />
        </div>
    );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function PipelinesIndex({
    activeTab,
    buyerLeads = [],
    propertyLeads = []
}: {
    activeTab: "buyer" | "property";
    buyerLeads?: any[];
    propertyLeads?: any[];
}) {
    const isBuyer = activeTab === "buyer";

    return (
        <DashboardLayout
            pageTitle="Pipelines"
            pageDescription="Track and manage all leads and properties through the pipeline."
            action={
                isBuyer ? (
                    <Link href={route("customer.add")} className="btn btn-primary flex items-center gap-2">
                        <UserPlus size={15} strokeWidth={2.5} />
                        Add Lead
                    </Link>
                ) : (
                    <Link href={route("seller.create")} className="btn btn-primary flex items-center gap-2">
                        <Building2 size={15} strokeWidth={2.5} />
                        Add Seller
                    </Link>
                )
            }
        >
            {isBuyer ? (
                <BuyerBoard leads={buyerLeads} />
            ) : (
                <PropertyBoard properties={propertyLeads} />
            )}
        </DashboardLayout>
    );
}
