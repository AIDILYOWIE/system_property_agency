import { useState } from "react";
import { router } from "@inertiajs/react";
import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { DataTable } from "@/Components/ui/data-table";
import { CustomerColumns, type CustomerData } from "./CustomerColumn";
import { Input } from "@/Components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

// ─── Filter State ──────────────────────────────────────────────────────────────

type FilterState = {
    customerType: string;
    pipelineStatus: string;
    source: string;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockCustomers: CustomerData[] = [
    {
        id: "cust-1",
        name: "Budi Santoso",
        phone: "08123456789",
        email: "budi.santoso@email.com",
        customer_type: "buyer",
        pipeline_status: "viewing",
        interested_property: "Modern Villa Ubud",
        source: "Website",
        created_at: "2026-08-01T10:00:00Z",
        last_contacted: "2026-08-20T09:00:00Z",
    },
    {
        id: "cust-2",
        name: "Sarah Wijaya",
        phone: "08198765432",
        email: "sarah.w@gmail.com",
        customer_type: "renter",
        pipeline_status: "negotiation",
        interested_property: "Minimalist Villa Canggu",
        source: "Instagram",
        created_at: "2026-08-03T14:30:00Z",
    },
    {
        id: "cust-3",
        name: "Pak Hartono",
        phone: "08112345678",
        customer_type: "property_owner",
        pipeline_status: "awaiting_payment",
        source: "Referral",
        created_at: "2026-08-05T09:15:00Z",
    },
    {
        id: "cust-4",
        name: "Mega Putri Lestari",
        phone: "08234567890",
        email: "mega.putri@outlook.com",
        customer_type: "buyer",
        pipeline_status: "new_lead",
        interested_property: "Beachfront Premium House Seminyak",
        source: "Website",
        created_at: "2026-08-10T16:45:00Z",
    },
    {
        id: "cust-5",
        name: "Reza Aditya",
        phone: "08567891234",
        customer_type: "buyer",
        pipeline_status: "contacted",
        interested_property: "Modern Villa Ubud",
        source: "Google",
        created_at: "2026-08-12T11:00:00Z",
    },
    {
        id: "cust-6",
        name: "Ibu Dewi Kusuma",
        phone: "08911234567",
        email: "dewi.kusuma@gmail.com",
        customer_type: "property_owner",
        pipeline_status: "qualifying",
        source: "WhatsApp",
        created_at: "2026-08-14T08:00:00Z",
    },
    {
        id: "cust-7",
        name: "Jonathan Tan",
        phone: "6281298765432",
        email: "jontan@corp.co",
        customer_type: "buyer",
        pipeline_status: "won",
        interested_property: "Beachfront Premium House Seminyak",
        source: "Referral",
        created_at: "2026-07-20T10:00:00Z",
    },
    {
        id: "cust-8",
        name: "Rina Marlina",
        phone: "08312345679",
        customer_type: "renter",
        pipeline_status: "lost",
        source: "Instagram",
        notes: "Moved to competitor agency",
        created_at: "2026-07-28T13:00:00Z",
    },
];

// ─── CustomerTable Component ────────────────────────────────────────────────────

export default function CustomerTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<FilterState>({
        customerType: "All Types",
        pipelineStatus: "All Statuses",
        source: "All Sources",
    });

    // ── Filter handlers ────────────────────────────────────────────────────────
    const setCustomerType = (val: string | null) =>
        setFilters((prev) => ({ ...prev, customerType: val ?? "All Types" }));
    const setPipelineStatus = (val: string | null) =>
        setFilters((prev) => ({ ...prev, pipelineStatus: val ?? "All Statuses" }));
    const setSource = (val: string | null) =>
        setFilters((prev) => ({ ...prev, source: val ?? "All Sources" }));

    // ── Active filter count (for badge) ───────────────────────────────────────
    const activeCount = [
        filters.customerType !== "All Types",
        filters.pipelineStatus !== "All Statuses",
        filters.source !== "All Sources",
    ].filter(Boolean).length;

    // ── Client-side filtering ─────────────────────────────────────────────────
    const filteredData = mockCustomers.filter((c) => {
        const matchesSearch =
            !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            (c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (c.interested_property?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const matchesType =
            filters.customerType === "All Types" ||
            c.customer_type === filters.customerType;

        const matchesStatus =
            filters.pipelineStatus === "All Statuses" ||
            c.pipeline_status === filters.pipelineStatus;

        const matchesSource =
            filters.source === "All Sources" ||
            c.source === filters.source;

        return matchesSearch && matchesType && matchesStatus && matchesSource;
    });

    return (
        <div className="flex flex-col gap-5">
            {/* ── Filter / Search Top Bar ─────────────────────────────────── */}
            <div className="flex items-center xl:flex-row xl:items-center gap-2 w-full">
                {/* Search Bar */}
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

                {/* Filters Dropdown */}
                <div className="flex items-center gap-3 overflow-y-auto xl:pb-0 scrollbar-hide">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="h-full flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg transition-colors ml-auto flex-shrink-0 outline-none border !bg-white border-border-base text-text-secondary hover:bg-canvas">
                            <SlidersHorizontal size={18} />
                            {activeCount > 0 && (
                                <span className="ml-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                    {activeCount}
                                </span>
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="font-sans grid grid-cols-2 p-2 gap-2"
                        >
                            {/* Customer Type */}
                            <DropdownMenuGroup className="pb-4">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Customer Type
                                </DropdownMenuLabel>
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <Select
                                        value={filters.customerType}
                                        onValueChange={setCustomerType}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Types">All Types</SelectItem>
                                            <SelectItem value="buyer">Buyer</SelectItem>
                                            <SelectItem value="renter">Renter</SelectItem>
                                            <SelectItem value="property_owner">
                                                Property Owner
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                            {/* Pipeline Status */}
                            <DropdownMenuGroup className="pb-4">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Pipeline Status
                                </DropdownMenuLabel>
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <Select
                                        value={filters.pipelineStatus}
                                        onValueChange={setPipelineStatus}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Statuses">All Statuses</SelectItem>
                                            <SelectItem value="new_lead">New Lead</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="viewing">Viewing</SelectItem>
                                            <SelectItem value="negotiation">Negotiation</SelectItem>
                                            <SelectItem value="won">WON</SelectItem>
                                            <SelectItem value="lost">LOST</SelectItem>
                                            <SelectItem value="new_request">New Request</SelectItem>
                                            <SelectItem value="qualifying">Qualifying</SelectItem>
                                            <SelectItem value="awaiting_payment">
                                                Awaiting Payment
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                            {/* Source */}
                            <DropdownMenuGroup className="pb-2 col-span-2">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Source
                                </DropdownMenuLabel>
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <Select
                                        value={filters.source}
                                        onValueChange={setSource}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Source" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Sources">All Sources</SelectItem>
                                            <SelectItem value="Website">Website</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="Google">Google</SelectItem>
                                            <SelectItem value="Referral">Referral</SelectItem>
                                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                            <SelectItem value="Manual">Manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Data Table ──────────────────────────────────────────────── */}
            <DataTable
                columns={CustomerColumns}
                data={filteredData}
                onRowClick={(row) =>
                    router.visit(route("customer.detail", { id: row.id }))
                }
            />
        </div>
    );
}
