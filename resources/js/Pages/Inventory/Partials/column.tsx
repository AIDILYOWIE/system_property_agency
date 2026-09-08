"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "@/Components/ui/table-data-features"
import { cn } from "@/lib/utils"
import { MapPin, Grid, Link2, Eye, Edit2, Upload, MoreHorizontal, ArrowUpDown, AlertTriangle } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Button } from "@/Components/ui/button"

export type PropertyStatus = "available" | "sold" | "rented" | "draft"

export type PropertyData = {
    id: string
    title: string
    location: string
    price: number
    currency: "IDR" | "USD"
    category: "Villa" | "Land" | "Commercial" | "Premium House"
    listingType: "For Sale" | "For Rent"
    status: PropertyStatus
    leads: number
    days_on_market: number
    thumbnail: string
}

import { formatCurrency } from "@/lib/format"

const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
        case "available":
            return "bg-status-available"
        case "sold":
            return "bg-status-sold"
        case "rented":
            return "bg-status-rented"
        case "draft":
            return "bg-draft-pattern"
        default:
            return "bg-gray-300"
    }
}


const performance = (days: number, leads: number) => {
    if (days >= 60 && leads == 0) {
        return true
    } else {
        false
    }
}

const columnHelper = createColumnHelper<DataTableFeatures, PropertyData>()

export const columns = columnHelper.columns([
    columnHelper.accessor("title", {
        id: "property",
        header: () => (
            <div className="">
                Property
            </div>
        ),
        cell: (info: any) => {
            const prop = info.row.original
            return (
                <div className="flex items-center gap-4 px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-border-base overflow-hidden flex-shrink-0 relative border border-border-base/50">
                        {prop.thumbnail ? (
                            <img
                                src={prop.thumbnail}
                                alt={prop.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted bg-canvas">
                                <Grid size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold text-text-primary mb-0.5 transition-colors line-clamp-1">
                            {prop.title}
                        </p>
                        <div className="flex items-center gap-3">
                            <p className="text-[11px] text-text-muted flex items-center gap-1 font-medium">
                                <MapPin size={11} /> {prop.location}
                            </p>
                            <div className="flex items-center gap-1.5 opacity-90">
                                <div
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        getStatusColor(prop.status)
                                    )}
                                />
                                <span className="text-[10px] text-text-muted font-medium capitalize">
                                    {prop.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    {performance(prop.days_on_market, prop.leads) && (
                        <AlertTriangle size={18} className="text-danger" />
                    )}
                </div>
            )
        },
    }),
    columnHelper.accessor("price", {
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-3 hover:text-text-muted !hover:bg-transparent h-8 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-text-muted uppercase"
            >
                Price
                <ArrowUpDown size={12} />
            </Button>
        ),
        cell: (info: any) => (
            <div className="px-6 py-4 font-semibold text-text-primary">
                {formatCurrency(info.getValue(), info.row.original.currency)}
            </div>
        ),
    }),
    columnHelper.accessor("category", {
        header: () => (
            <div className="">
                Category
            </div>
        ),
        cell: (info: any) => (
            <div className="px-6 py-4 text-text-muted font-medium text-[13px]">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("listingType", {
        header: () => (
            <div className="">
                Listing Type
            </div>
        ),
        cell: (info: any) => (
            <div className="px-6 py-4">
                <span
                    className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        info.getValue() === "For Sale"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-purple-50 text-purple-600 border border-purple-100"
                    )}
                >
                    {info.getValue()}
                </span>
            </div>
        ),
    }),
    columnHelper.display({
        id: "performance",
        header: () => (
            <div>
                Performance
            </div>
        ),
        cell: (info: any) => {
            const prop = info.row.original

            return (
                <div className={`px-6 py-4 flex items-center jutify-start gap-2 ${performance(prop.days_on_market, prop.leads) ? "text-danger" : "text-text-muted"}`}>

                    <div className="flex flex-col ">
                        <h2 className={" font-medium text-[13px]"}>
                            {prop.days_on_market} Days
                        </h2>
                        <h2 className={" font-medium text-[13px]"}>
                            {prop.leads} Leads
                        </h2>
                    </div>
                </div>
            )
        }
    }),
    columnHelper.display({
        id: "actions",
        header: () => (
            <div className="w-max">
                Action
            </div>
        ),
        cell: (info: any) => {
            const isDraft = info.row.original.visibility === "draft"
            return (
                <div
                    className="flex items-center justify-center gap-2 px-6 py-4 w-max h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="w-8 h-8 rounded-lg border border-border-base flex items-center justify-center text-text-muted transition-colors focus:outline-none data-[state=open]:bg-primary-50 data-[state=open]:text-primary outline-none"
                            title="More Options"
                        >
                            <MoreHorizontal size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 font-sans">
                            {/* Toggle Publish/Draft */}
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    import("@inertiajs/react").then(({ router }) => {
                                        router.patch(`/inventory/${info.row.original.id}/visibility`, {
                                            visibility: isDraft ? 'published' : 'draft'
                                        }, { preserveScroll: true });
                                    });
                                }}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                <span>{isDraft ? "Publish to Public" : "Hide to Draft"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!isDraft && (
                                <>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link2 className="mr-2 h-4 w-4" />
                                        <span>Copy Secret Link</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>View Analytics</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                import("@inertiajs/react").then(({ router }) => {
                                    router.visit(`/inventory/edit/${info.row.original.id}`);
                                });
                            }}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Edit Property</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }),
])