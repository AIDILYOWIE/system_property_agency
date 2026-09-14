"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "@/Components/ui/table-data-features"
import { cn } from "@/lib/utils"
import {
    MoreHorizontal,
    Eye,
    Edit2,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Button } from "@/Components/ui/button"
import { router } from "@inertiajs/react"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SellerData = {
    id: string
    name: string
    phone: string
    email?: string
    source: string
    notes?: string
    created_at: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

// ─── Column Definition ─────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DataTableFeatures, SellerData>()

export const SellerColumns = columnHelper.columns([
    // ── Seller Info ────────────────────────────────────────────────────────────
    columnHelper.accessor("name", {
        id: "seller",
        header: () => <div>Seller</div>,
        cell: (info: any) => {
            const seller = info.row.original
            const initials = seller.name
                .split(" ")
                .slice(0, 2)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()

            return (
                <div className="flex items-center gap-4 px-6 py-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-sm select-none border border-primary/20">
                        {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-text-primary mb-0.5 line-clamp-1">
                            {seller.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[11px] text-text-muted font-medium">
                                {seller.phone}
                            </p>
                            {seller.email && (
                                <>
                                    <span className="text-border-base">·</span>
                                    <p className="text-[11px] text-text-muted font-medium truncate">
                                        {seller.email}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
    }),

    // ── Source ────────────────────────────────────────────────────────────────
    columnHelper.accessor("source", {
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="-ml-3 hover:text-text-muted !hover:bg-transparent h-8 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-text-muted uppercase"
            >
                Source
            </Button>
        ),
        cell: (info: any) => (
            <div className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-canvas text-text-muted border border-border-base uppercase tracking-wider">
                    {info.getValue()}
                </span>
            </div>
        ),
    }),

    // ── Notes ─────────────────────────────────────────────────────────────────
    columnHelper.accessor("notes", {
        header: () => <div>Initial Notes</div>,
        cell: (info: any) => (
            <div className="px-6 py-4 text-text-muted font-medium text-[13px] max-w-[200px]">
                {info.getValue() ? (
                    <span className="line-clamp-1">{info.getValue()}</span>
                ) : (
                    <span className="text-text-muted/50 italic text-xs">—</span>
                )}
            </div>
        ),
    }),

    // ── Date Added ────────────────────────────────────────────────────────────
    columnHelper.accessor("created_at", {
        header: () => <div>Date Added</div>,
        cell: (info: any) => (
            <div className="px-6 py-4 text-[13px] text-text-muted font-medium">
                {formatDate(info.getValue())}
            </div>
        ),
    }),

    // ── Actions ───────────────────────────────────────────────────────────────
    columnHelper.display({
        id: "actions",
        header: () => <div className="w-max">Action</div>,
        cell: (info: any) => {
            const seller = info.row.original

            return (
                <div className="flex items-center justify-center gap-2 px-6 py-4 w-max h-full">
                    {/* More Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="w-8 h-8 rounded-lg border border-border-base flex items-center justify-center text-text-muted transition-colors focus:outline-none data-[state=open]:bg-primary-50 data-[state=open]:text-primary outline-none"
                            title="More Options"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 font-sans">
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.visit(route("seller.show", { seller: seller.id }));
                                }}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" disabled>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Edit Seller</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }),
])
