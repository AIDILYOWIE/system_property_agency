import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Plus } from "lucide-react";
import { toast } from "@/Components/ui/toast";
import { ALL_LUCIDE_ICONS } from "@/Components/icons";
import { DataTable } from "@/Components/ui/data-table";
import { getColumns, Facility, FacilitiesContext } from "./column";

export default function FacilitiesManager({ facilities }: { facilities: Facility[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [form, setForm] = useState({
        category: "",
        name: "",
        icon_name: ""
    });

    const resetForm = () => {
        setForm({
            category: "",
            name: "",
            icon_name: ""
        });
        setIsAdding(false);
        setEditId(null);
    };

    const handleSave = () => {
        if (!form.category || !form.name || !form.icon_name) {
            toast.add({
                title: "Error",
                description: "Isi semua kolom yang diperlukan.",
                type: "error"
            });
            return;
        }

        if (editId) {
            router.put(route('settings.facilities.update', editId), form, {
                onSuccess: () => resetForm(),
            });
        } else {
            router.post(route('settings.facilities.store'), form, {
                onSuccess: () => resetForm(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus fasilitas ini?")) {
            router.delete(route('settings.facilities.destroy', id));
        }
    }

    const existingCategories = useMemo(() => Array.from(new Set(facilities.map(f => f.category))).map(cat => ({ label: cat, value: cat })), [facilities]);
    const iconOptions = useMemo(() => [...ALL_LUCIDE_ICONS], []);

    const tableData = useMemo(() => {
        return isAdding
            ? [{ id: -1, category: "", name: "", icon_name: "" } as Facility, ...facilities]
            : facilities;
    }, [isAdding, facilities]);

    const columns = useMemo(() => getColumns(), []);

    const contextValue = {
        editId, form, setForm, existingCategories, iconOptions,
        handleSave, resetForm, setIsAdding, setEditId, handleDelete
    };

    return (
        <FacilitiesContext.Provider value={contextValue}>
            <div className="bg-white p-6 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Daftar Fasilitas</h2>
                    {!isAdding && !editId && (
                        <button onClick={() => { setIsAdding(true); setForm({ category: "", name: "", icon_name: "" }); setEditId(null); }} className="btn btn-primary text-sm flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Facility
                        </button>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={tableData}
                />
            </div>
        </FacilitiesContext.Provider>
    );
}
