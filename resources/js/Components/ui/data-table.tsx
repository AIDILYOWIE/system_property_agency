"use client"

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table"

import { features, type DataTableFeatures } from "./table-data-features"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./pagination"

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
}

export function DataTable<TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) {
    const table = useTable({
        features,
        data,
        columns,
        initialState: {
            pagination: {
                pageSize: 5,
                pageIndex: 0,
            },
        },
    })

    return (
        <div className="bg-white border border-border-base rounded-2xl overflow-hidden shadow-card">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-canvas border-b border-border-base hover:bg-canvas">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="text-[11px] uppercase tracking-wider text-text-muted font-semibold px-6 py-4">
                                        {header.isPlaceholder ? null : (
                                            <table.FlexRender header={header} />
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            // Custom dimming for draft rows (if 'status' exists and is 'draft')
                            const isDraft = (row.original as any).status === "draft";
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`hover:bg-gray-50 hover:cursor-pointer transition-colors group ${isDraft ? "opacity-60 grayscale-[10%]" : ""
                                        }`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-0">
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-text-muted">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border-base px-6 py-3">
                <div className="text-xs text-text-muted flex-shrink-0 font-medium">
                    Showing {table.getRowModel().rows.length > 0 ? (table.state.pagination.pageIndex * table.state.pagination.pageSize + 1) : 0} to{" "}
                    {Math.min(table.getFilteredRowModel().rows.length, (table.state.pagination.pageIndex + 1) * table.state.pagination.pageSize)}{" "}
                    of {table.getFilteredRowModel().rows.length} entries
                </div>
                <Pagination className="w-auto mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    table.previousPage();
                                }}
                                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {table.getPageCount() > 0 && Array.from({ length: table.getPageCount() }).map((_, i) => {
                            const currentPage = table.state.pagination.pageIndex;
                            // Show first, last, current, and immediate neighbors
                            if (i === 0 || i === table.getPageCount() - 1 || Math.abs(currentPage - i) <= 1) {
                                return (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                table.setPageIndex(i);
                                            }}
                                            isActive={currentPage === i}
                                            className="font-medium text-xs h-8 w-8"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            }
                            // Show ellipsis if exactly one gap away
                            if (
                                (i === 1 && currentPage > 2) ||
                                (i === table.getPageCount() - 2 && currentPage < table.getPageCount() - 3)
                            ) {
                                return (
                                    <PaginationItem key={`ellipsis-${i}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }
                            return null;
                        })}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    table.nextPage();
                                }}
                                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}