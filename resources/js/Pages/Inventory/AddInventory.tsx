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

export default function AddInventory({ facilitiesMaster, seller_id }: { facilitiesMaster: any[], seller_id?: string }) {
    return (
        <DashboardLayout
            pageTitle="Add New Property"
            pageDescription="Fill in the details to list a new property in your inventory."
            action={
                <div className="flex gap-2">
                    <button
                        type="submit"
                        form="inventory-form"
                        name="action_type"
                        value="draft"
                        formNoValidate
                        className="btn bg-white border border-border-base text-text-primary hover:bg-gray-50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold px-4 py-2 rounded-lg text-sm"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        form="inventory-form"
                        name="action_type"
                        value="publish"
                        className="btn btn-primary"
                    >
                        <Check size={15} strokeWidth={2.5} />
                        Publish
                    </button>
                </div>
            }
        >
            <InventoryForm facilitiesMaster={facilitiesMaster} sellerId={seller_id} />
        </DashboardLayout>
    );
}
