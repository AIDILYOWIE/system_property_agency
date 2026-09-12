import React, { createContext, useContext } from "react";
import { Edit2, Trash2, CheckCircle2, MoreHorizontal, X } from "lucide-react";
import * as icons from "lucide-react";
import { CreatableSelect } from "@/Components/ui/creatable-select";
import { Input } from "@/Components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

export interface Facility {
    id: number;
    category: string;
    name: string;
    icon_name: string;
}

export const FacilitiesContext = createContext<any>(null);

const DynamicIcon = ({ name }: { name: string }) => {
    // @ts-ignore
    const LucideIcon = (icons as any)[name];
    if (!LucideIcon) return <span>-</span>;
    return <LucideIcon className="w-5 h-5" />;
};

const CategoryCell = ({ row }: { row: any }) => {
    const { editId, form, setForm, existingCategories } = useContext(FacilitiesContext);
    const fac = row.original;
    const isEditing = editId === fac.id || fac.id === -1;
    return (
        <div className="px-6 py-4">
            {isEditing ? (
                <CreatableSelect
                    value={form.category}
                    onChange={(val) => setForm((prev: any) => ({ ...prev, category: val }))}
                    options={existingCategories}
                    placeholder="Select or Create..."
                    onCreateOption={(val) => setForm((prev: any) => ({ ...prev, category: val }))}
                />
            ) : (
                <span className="font-semibold text-[13px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                    {fac.category}
                </span>
            )}
        </div>
    );
};

const NameCell = ({ row }: { row: any }) => {
    const { editId, form, setForm } = useContext(FacilitiesContext);
    const fac = row.original;
    const isEditing = editId === fac.id || fac.id === -1;
    return (
        <div className="px-6 py-4">
            {isEditing ? (
                <Input
                    className="!bg-canvas w-full"
                    placeholder={fac.id === -1 ? "e.g. AC, Kolam Renang" : ""}
                    value={form.name}
                    onChange={(e: any) => setForm((prev: any) => ({ ...prev, name: e.target.value }))}
                />
            ) : (
                <span className="text-gray-800 font-medium text-[13px]">{fac.name}</span>
            )}
        </div>
    );
};

const IconCell = ({ row }: { row: any }) => {
    const { editId, form, setForm, iconOptions } = useContext(FacilitiesContext);
    const fac = row.original;
    const isEditing = editId === fac.id || fac.id === -1;
    return (
        <div className="px-6 py-4">
            {isEditing ? (
                <CreatableSelect
                    value={form.icon_name}
                    onChange={(val) => setForm((prev: any) => ({ ...prev, icon_name: val }))}
                    options={iconOptions}
                    placeholder="Lucide Icon..."
                    onCreateOption={(val) => setForm((prev: any) => ({ ...prev, icon_name: val }))}
                />
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-primary flex items-center justify-center">
                        <DynamicIcon name={fac.icon_name} />
                    </span>
                    <span className="text-gray-800 font-medium text-[13px]">{fac.icon_name}</span>
                </div>
            )}
        </div>
    );
};

const ActionsCell = ({ row }: { row: any }) => {
    const { editId, form, setForm, handleSave, resetForm, setIsAdding, setEditId, handleDelete } = useContext(FacilitiesContext);
    const fac = row.original;
    const isEditing = editId === fac.id || fac.id === -1;
    return (
        <div
            className="flex items-center justify-end gap-3 px-6 py-4 w-max h-full ml-auto"
            onClick={(e) => e.stopPropagation()}
        >
            {isEditing ? (
                <>
                    <button
                        onClick={(e: any) => { e.stopPropagation(); handleSave(); }}
                        className="w-8 h-8 flex items-center justify-center text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                        title="Save"
                    >
                        <CheckCircle2 size={16} />
                    </button>
                    <button
                        onClick={(e: any) => { e.stopPropagation(); resetForm(); }}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                        title="Cancel"
                    >
                        <X size={16} />
                    </button>
                </>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="w-8 h-8 rounded-lg border border-border-base flex items-center justify-center text-text-muted transition-colors focus:outline-none data-[state=open]:bg-primary-50 data-[state=open]:text-primary outline-none"
                        title="More Options"
                    >
                        <MoreHorizontal size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 font-sans">
                        <DropdownMenuItem className="cursor-pointer" onClick={(e: any) => {
                            e.stopPropagation();
                            setEditId(fac.id);
                            setForm({ category: fac.category, name: fac.name, icon_name: fac.icon_name });
                            setIsAdding(false);
                        }}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit Facility</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={(e: any) => {
                            e.stopPropagation();
                            handleDelete(fac.id);
                        }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Facility</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};

export const getColumns = (): any[] => {
    return [
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: any) => <CategoryCell row={row} />
        },
        {
            accessorKey: "name",
            header: "Facility Name",
            cell: ({ row }: any) => <NameCell row={row} />
        },
        {
            accessorKey: "icon_name",
            header: "Icon (Lucide Name)",
            cell: ({ row }: any) => <IconCell row={row} />
        },
        {
            id: "actions",
            header: () => (
                <div className="w-max ml-auto">
                    Action
                </div>
            ),
            cell: ({ row }: any) => <ActionsCell row={row} />
        }
    ];
};
