import { useState } from "react";
import { router } from "@inertiajs/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DataTable } from "@/Components/ui/data-table";
import { columns, PropertyData } from "./column";
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

// ─── Filter state type ─────────────────────────────────────────────────────────
type FilterState = {
    search?: string | null;
    category: string | null;
    listingType: string | null;
    status: string | null;
    visibility: string | null;
    partnership: string | null;
};

interface InventoryTableProps {
    properties: {
        data: PropertyData[];
        links: any[]; // Pagination links
    };
    initialFilters: any;
}

export default function InventoryTable({ properties, initialFilters }: InventoryTableProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: initialFilters?.search || "",
        category: initialFilters?.category || "All Categories",
        listingType: initialFilters?.listingType || "All Listing Types",
        status: initialFilters?.status || "All Status",
        visibility: initialFilters?.visibility || "All Visibilities",
        partnership: initialFilters?.partnership || "All Partnerships",
    });

    // Helper to fetch data via Inertia
    const applyFilters = (newFilters: FilterState) => {
        router.get(route('inventory'), newFilters as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleFilterChange = (key: keyof FilterState, val: string | null) => {
        const nextFilters = { ...filters, [key]: val };
        setFilters(nextFilters);
        applyFilters(nextFilters);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextFilters = { ...filters, search: e.target.value };
        setFilters(nextFilters);
        // Debounce can be implemented here if desired; for now, relying on enter key or standard behavior.
    };

    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters(filters);
        }
    };

    // Count active filters for badge indicator
    const activeCount = [
        filters.category !== "All Categories",
        filters.listingType !== "All Listing Types",
        filters.status !== "All Status",
        filters.visibility !== "All Visibilities",
        filters.partnership !== "All Partnerships",
    ].filter(Boolean).length;

    return (
        <div className="flex flex-col gap-5">
            {/* Filter/Search Top Bar */}
            <div className="flex items-center xl:flex-row xl:items-center gap-2 w-full">
                {/* Search Bar */}
                <div className="relative w-72 flex-shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                        type="text"
                        placeholder="Search properties (Press Enter)..."
                        value={filters.search || ""}
                        onChange={handleSearch}
                        onKeyDown={handleSearchSubmit}
                        className="w-full !bg-white border border-border-base rounded-lg py-3 pl-10 pr-4 text-sm focus:border-border-base transition-colors text-text-primary h-auto"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 overflow-y-auto xl:pb-0 scrollbar-hide">
                    {/* More Filters — All filters inside dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="h-full flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg transition-colors ml-auto flex-shrink-0 outline-none border !bg-white border-border-base text-text-secondary hover:bg-canvas"
                        >
                            <SlidersHorizontal size={18} />
                            {activeCount > 0 && (
                                <span className="ml-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                    {activeCount}
                                </span>
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className=" font-sans grid grid-cols-2 p-2 gap-2">

                            {/* Category */}
                            <DropdownMenuGroup className=" pb-4">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Category
                                </DropdownMenuLabel>
                                {/* Stop propagation so clicking select doesn't immediately close dropdown menu incorrectly */}
                                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <Select value={filters.category || ""} onValueChange={(val) => handleFilterChange('category', val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Categories">All Categories</SelectItem>
                                            <SelectItem value="villas">Villa</SelectItem>
                                            <SelectItem value="strategic_land">Land</SelectItem>
                                            <SelectItem value="commercial">Commercial</SelectItem>
                                            <SelectItem value="premium_houses">Premium House</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                            {/* Listing Type */}
                            <DropdownMenuGroup className="pb-4">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Listing Type
                                </DropdownMenuLabel>
                                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <Select value={filters.listingType || ""} onValueChange={(val) => handleFilterChange('listingType', val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Listing Type" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Listing Types">All Listing Types</SelectItem>
                                            <SelectItem value="For Sale">For Sale</SelectItem>
                                            <SelectItem value="For Rent">For Rent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                            {/* Status */}
                            <DropdownMenuGroup className="pb-4">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Status
                                </DropdownMenuLabel>
                                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <Select value={filters.status || ""} onValueChange={(val) => handleFilterChange('status', val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Status">All Status</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="rented">Rented</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                            {/* Visibility */}
                            <DropdownMenuGroup className="pb-4">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Visibility
                                </DropdownMenuLabel>
                                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <Select value={filters.visibility || ""} onValueChange={(val) => handleFilterChange('visibility', val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Visibilities">All Visibilities</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Reusable Data Table Component */}
            <DataTable
                columns={columns}
                data={properties.data}
                onRowClick={(row) => router.visit(route('inventory.detail', { id: row.id }))}
            />
        </div>
    );
}
