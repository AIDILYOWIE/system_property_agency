"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "@/Components/ui/table-data-features"
import { cn } from "@/lib/utils"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import {
    MessageCircle,
    Eye,
    Edit2,
    MoreHorizontal,
    ArrowUpDown,
    User,
    Building2,
    Badge,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Button } from "@/Components/ui/button"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PipelineStatus =
    | "new_lead"
    | "contacted"
    | "viewing"
    | "negotiation"
    | "won"
    | "lost"
    | "new_request"
    | "qualifying"
    | "awaiting_payment"

export type CustomerType = "buyer" | "renter" | "property_owner"

export type CustomerData = {
    id: string
    name: string
    phone: string
    email?: string
    customer_type: CustomerType
    pipeline_status: PipelineStatus
    interested_property?: string
    source: string
    notes?: string
    created_at: string
    last_contacted?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getPipelineStatusStyle = (status: PipelineStatus) => {
    switch (status) {
        case "new_lead":
        case "new_request":
            return "bg-blue-50 text-blue-600 border border-blue-100"
        case "contacted":
        case "qualifying":
            return "bg-amber-50 text-amber-600 border border-amber-100"
        case "viewing":
            return "bg-violet-50 text-violet-600 border border-violet-100"
        case "negotiation":
        case "awaiting_payment":
            return "bg-orange-50 text-orange-600 border border-orange-100"
        case "won":
            return "bg-emerald-50 text-emerald-600 border border-emerald-100"
        case "lost":
            return "bg-red-50 text-red-500 border border-red-100"
        default:
            return "bg-gray-50 text-gray-500 border border-gray-100"
    }
}

const getPipelineStatusLabel = (status: PipelineStatus) => {
    const map: Record<PipelineStatus, string> = {
        new_lead: "New Lead",
        contacted: "Contacted",
        viewing: "Viewing",
        negotiation: "Negotiation",
        won: "WON",
        lost: "LOST",
        new_request: "New Request",
        qualifying: "Qualifying",
        awaiting_payment: "Awaiting Payment",
    }
    return map[status] ?? status
}

const getCustomerTypeStyle = (type: CustomerType) => {
    switch (type) {
        case "buyer":
            return "bg-sky-50 text-sky-600 border border-sky-100"
        case "renter":
            return "bg-purple-50 text-purple-600 border border-purple-100"
        case "property_owner":
            return "bg-teal-50 text-teal-600 border border-teal-100"
        default:
            return "bg-gray-50 text-gray-500 border border-gray-100"
    }
}

const getCustomerTypeLabel = (type: CustomerType) => {
    const map: Record<CustomerType, string> = {
        buyer: "Buyer",
        renter: "Renter",
        property_owner: "Property Owner",
    }
    return map[type] ?? type
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

// ─── Column Definition ─────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DataTableFeatures, CustomerData>()

export const CustomerColumns = columnHelper.columns([
    // ── Customer Info ──────────────────────────────────────────────────────────
    columnHelper.accessor("name", {
        id: "customer",
        header: () => <div>Customer</div>,
        cell: (info: any) => {
            const customer = info.row.original
            const initials = customer.name
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
                            {customer.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[11px] text-text-muted font-medium">
                                {customer.phone}
                            </p>
                            {customer.email && (
                                <>
                                    <span className="text-border-base">·</span>
                                    <p className="text-[11px] text-text-muted font-medium truncate">
                                        {customer.email}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
    }),


    // ── Pipeline Status ────────────────────────────────────────────────────────
    columnHelper.accessor("pipeline_status", {
        header: () => <div>Pipeline Status</div>,
        cell: (info: any) => (
            <div className="px-6 py-4">
                <span
                    className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        getPipelineStatusStyle(info.getValue())
                    )}
                >
                    {getPipelineStatusLabel(info.getValue())}
                </span>
            </div>
        ),
    }),

    // ── Interested Property ────────────────────────────────────────────────────
    // columnHelper.accessor("interested_property", {
    //     header: () => <div>Interested Property</div>,
    //     cell: (info: any) => (
    //         <div className="px-6 py-4 text-text-muted font-medium text-[13px]">
    //             {info.getValue() ? (
    //                 <span className="line-clamp-1">{info.getValue()}</span>
    //             ) : (
    //                 <span className="text-text-muted/50 italic text-xs">—</span>
    //             )}
    //         </div>
    //     ),
    // }),

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
            const customer = info.row.original

            const waUrl = getWhatsAppUrl({
                phone: customer.phone,
                clientName: customer.name,
                customerType: customer.customer_type,
                // propertyName: customer.interested_property,
            })

            return (
                <div className="flex items-center justify-center gap-2 px-6 py-4 w-max h-full">
                    {/* One-Click WA Button
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="One-Click WhatsApp Follow-Up"
                    >
                        <MessageCircle size={14} />
                    </a> */}

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
                            <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Edit Customer</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }),
])
