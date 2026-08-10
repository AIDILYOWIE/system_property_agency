import { useState } from "react";
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
    category: string | null;
    listingType: string | null;
    status: string | null;
    visibility: string | null;
    partnership: string | null;
};

const mockProperties: PropertyData[] = [
    {
        id: "prop-1",
        title: "Modern Villa Ubud",
        location: "Ubud, Bali",
        price: 850000,
        currency: "USD",
        category: "Villa",
        listingType: "For Sale",
        status: "available",
        thumbnail:
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-2",
        title: "Minimalist Villa Canggu",
        location: "Canggu, Bali",
        price: 35000,
        currency: "USD",
        category: "Villa",
        listingType: "For Rent",
        status: "rented",
        thumbnail:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-3",
        title: "Beachfront Premium House",
        location: "Seminyak, Bali",
        price: 2100000,
        currency: "USD",
        category: "Premium House",
        listingType: "For Sale",
        status: "sold",
        thumbnail:
            "https://images.unsplash.com/photo-1613490908592-fd5a12130325?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-4",
        title: "Strategic Land Uluwatu",
        location: "Uluwatu, Bali",
        price: 420000,
        currency: "USD",
        category: "Land",
        listingType: "For Sale",
        status: "draft",
        thumbnail:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-5",
        title: "Commercial Space Berawa",
        location: "Berawa, Bali",
        price: 1500000,
        currency: "USD",
        category: "Commercial",
        listingType: "For Rent",
        status: "draft",
        thumbnail: "",
    },
    {
        id: "prop-2",
        title: "Minimalist Villa Canggu",
        location: "Canggu, Bali",
        price: 35000,
        currency: "USD",
        category: "Villa",
        listingType: "For Rent",
        status: "rented",
        thumbnail:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-3",
        title: "Beachfront Premium House",
        location: "Seminyak, Bali",
        price: 2100000,
        currency: "USD",
        category: "Premium House",
        listingType: "For Sale",
        status: "sold",
        thumbnail:
            "https://images.unsplash.com/photo-1613490908592-fd5a12130325?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-4",
        title: "Strategic Land Uluwatu",
        location: "Uluwatu, Bali",
        price: 420000,
        currency: "USD",
        category: "Land",
        listingType: "For Sale",
        status: "draft",
        thumbnail:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-5",
        title: "Commercial Space Berawa",
        location: "Berawa, Bali",
        price: 1500000,
        currency: "USD",
        category: "Commercial",
        listingType: "For Rent",
        status: "draft",
        thumbnail: "",
    },
    {
        id: "prop-2",
        title: "Minimalist Villa Canggu",
        location: "Canggu, Bali",
        price: 35000,
        currency: "USD",
        category: "Villa",
        listingType: "For Rent",
        status: "rented",
        thumbnail:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-3",
        title: "Beachfront Premium House",
        location: "Seminyak, Bali",
        price: 2100000,
        currency: "USD",
        category: "Premium House",
        listingType: "For Sale",
        status: "sold",
        thumbnail:
            "https://images.unsplash.com/photo-1613490908592-fd5a12130325?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-4",
        title: "Strategic Land Uluwatu",
        location: "Uluwatu, Bali",
        price: 420000,
        currency: "USD",
        category: "Land",
        listingType: "For Sale",
        status: "draft",
        thumbnail:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-5",
        title: "Commercial Space Berawa",
        location: "Berawa, Bali",
        price: 1500000,
        currency: "USD",
        category: "Commercial",
        listingType: "For Rent",
        status: "draft",
        thumbnail: "",
    },
    {
        id: "prop-2",
        title: "Minimalist Villa Canggu",
        location: "Canggu, Bali",
        price: 35000,
        currency: "USD",
        category: "Villa",
        listingType: "For Rent",
        status: "rented",
        thumbnail:
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-3",
        title: "Beachfront Premium House",
        location: "Seminyak, Bali",
        price: 2100000,
        currency: "USD",
        category: "Premium House",
        listingType: "For Sale",
        status: "sold",
        thumbnail:
            "https://images.unsplash.com/photo-1613490908592-fd5a12130325?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-4",
        title: "Strategic Land Uluwatu",
        location: "Uluwatu, Bali",
        price: 420000,
        currency: "USD",
        category: "Land",
        listingType: "For Sale",
        status: "draft",
        thumbnail:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
        id: "prop-5",
        title: "Commercial Space Berawa",
        location: "Berawa, Bali",
        price: 1500000,
        currency: "USD",
        category: "Commercial",
        listingType: "For Rent",
        status: "draft",
        thumbnail: "",
    },
];

export default function InventoryTable() {
    const [filters, setFilters] = useState<FilterState>({
        category: "All Categories",
        listingType: "All Listing Types",
        status: "All Status",
        visibility: "All Visibilities",
        partnership: "All Partnerships",
    });

    // set category
    const setCategory = (val: string | null) => {
        setFilters((prev) => ({ ...prev, category: val }));
    };

    // set listing type
    const setListingType = (val: string | null) => {
        setFilters((prev) => ({ ...prev, listingType: val }));
    };

    // set status
    const setStatus = (val: string | null) => {
        setFilters((prev) => ({ ...prev, status: val }));
    };

    // set visibility
    const setVisibility = (val: string | null) => {
        setFilters((prev) => ({ ...prev, visibility: val }));
    };

    // set partnership
    const setPartnership = (val: string | null) => {
        setFilters((prev) => ({ ...prev, partnership: val }));
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
                        placeholder="Search properties..."
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
                                    <Select value={filters.category} onValueChange={(val) => setCategory(val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Categories">All Categories</SelectItem>
                                            <SelectItem value="Villa">Villa</SelectItem>
                                            <SelectItem value="Land">Land</SelectItem>
                                            <SelectItem value="Commercial">Commercial</SelectItem>
                                            <SelectItem value="Premium House">Premium House</SelectItem>
                                            <SelectItem value="Apartment">Apartment</SelectItem>
                                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                                            <SelectItem value="Warehouse">Warehouse</SelectItem>
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
                                    <Select value={filters.listingType || ""} onValueChange={(val) => setListingType(val)}>
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
                                    <Select value={filters.status || ""} onValueChange={(val) => setStatus(val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Status">All Status</SelectItem>
                                            <SelectItem value="Available">Available</SelectItem>
                                            <SelectItem value="Sold">Sold</SelectItem>
                                            <SelectItem value="Rented">Rented</SelectItem>
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
                                    <Select value={filters.visibility || ""} onValueChange={(val) => setVisibility(val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Visibilities">All Visibilities</SelectItem>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                            {/* Partnership */}
                            <DropdownMenuGroup className="pb-2">
                                <DropdownMenuLabel className="text-text-muted uppercase tracking-wider text-[10px] px-0 pb-1.5 pt-0">
                                    Partnership
                                </DropdownMenuLabel>
                                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <Select value={filters.partnership || ""} onValueChange={(val) => setPartnership(val)}>
                                        <SelectTrigger className="w-full h-8 text-xs bg-canvas hover:bg-canvas/80 border-border-base transition-colors">
                                            <SelectValue placeholder="Partnership" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="font-sans">
                                            <SelectItem value="All Partnerships">All Partnerships</SelectItem>
                                            <SelectItem value="Open Listing">Open Listing</SelectItem>
                                            <SelectItem value="Exclusive">Exclusive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DropdownMenuGroup>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Reusable Data Table Component */}
            <DataTable columns={columns} data={mockProperties} />
        </div>
    );
}
