"use client";

import { useState, useRef } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    Info,
    LayoutGrid,
    Tag,
    ImageIcon,
    LockKeyhole,
    MapPin,
    BedDouble,
    Bath,
    ChevronLeft,
    Check,
    UploadCloud,
    PlusCircle,
} from "lucide-react";
import InventoryForm from "./Partials/InventoryForm";

export default function AddInventory({ facilitiesMaster }: { facilitiesMaster: any[] }) {
    return (
        <DashboardLayout
            pageTitle="Add New Property"
            pageDescription="Fill in the details to list a new property in your inventory."
            action={
                <div className="flex gap-2">
                    <button
                        type="submit"
                        form="inventory-form"
                        className="btn btn-primary"
                    >
                        <Check size={15} strokeWidth={2.5} />
                        Publish
                    </button>
                </div>
            }
        >
            <InventoryForm facilitiesMaster={facilitiesMaster} />
        </DashboardLayout>
    );
}
