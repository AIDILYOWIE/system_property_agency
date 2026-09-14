import { useState } from "react";
import { router } from "@inertiajs/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DataTable } from "@/Components/ui/data-table";
import { SellerColumns, type SellerData } from "./SellerColumn";
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
import { cn } from "@/lib/utils";

// ─── Filter State ──────────────────────────────────────────────────────────────

type FilterState = {
    source: string;
};

// ─── SellerTable Component ────────────────────────────────────────────────────

export default function SellerTable({ data }: { data: SellerData[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<FilterState>({
        source: "All Sources",
    });

    // ── Filter handlers ────────────────────────────────────────────────────────
    const setSource = (val: string | null) =>
        setFilters((prev) => ({ ...prev, source: val ?? "All Sources" }));

    // ── Active filter count (for badge) ───────────────────────────────────────
    const activeCount = [
        filters.source !== "All Sources",
    ].filter(Boolean).length;

    // ── Client-side filtering ─────────────────────────────────────────────────
    const filteredData = data.filter((s) => {
        const matchesSearch =
            !searchQuery ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.phone.includes(searchQuery) ||
            (s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const matchesSource =
            filters.source === "All Sources" ||
            s.source === filters.source;

        return matchesSearch && matchesSource;
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
                        placeholder="Search sellers..."
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
                            className="font-sans grid grid-cols-1 p-2 gap-2 w-48"
                        >
                            {/* Source */}
                            <DropdownMenuGroup className="pb-2">
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
                                            <SelectItem value="Tiktok">Tiktok</SelectItem>
                                            <SelectItem value="Referral">Referral / Rekomendasi</SelectItem>
                                            <SelectItem value="Marketplace">Marketplace</SelectItem>
                                            <SelectItem value="Walk-in">Walk-in</SelectItem>
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
                columns={SellerColumns}
                data={filteredData}
                onRowClick={(row) =>
                    router.visit(route("seller.show", { seller: row.id }))
                }
            />
        </div>
    );
}
