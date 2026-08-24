"use client";

import { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Check } from "lucide-react";
import InventoryForm from "./Partials/InventoryForm";

export default function EditInventory() {
    function handleSaveDraft() {
        console.log("Save as Draft");
    }

    function handlePublish(e: React.FormEvent) {
        e.preventDefault();
        console.log("Update Listing");
    }

    const mockPropertyData = {
        title: "Modern Villa Ubud",
        location: "Ubud, Bali",
        description: "Experience luxury living in the heart of Ubud. This modern villa features a spacious open-plan living area, a private infinity pool overlooking the jungle, and fully equipped modern kitchen. Built with premium materials, smart home integration, and sustainable design elements.",
        price: "850000",
        currency: "USD" as const,
        partnership: "open_slot_1" as any,
        landSize: "350",
        buildingSize: "200",
        bedrooms: "3",
        bathrooms: "3.5",
        listingType: "sale" as const,
        category: "villas" as any,
        titleStatus: "freehold" as any,
        leaseholdYears: "",
        projectedRoi: "12",
        zoning: "yellow" as any,
    };

    return (
        <DashboardLayout
            pageTitle="Edit Property"
            pageDescription="Update the details of your property listing."
            action={
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="btn btn-secondary"
                    >
                        Save as Draft
                    </button>
                    <button type="submit" className="btn btn-primary" onClick={handlePublish}>
                        <Check size={15} strokeWidth={2.5} />
                        Update Property
                    </button>
                </div>
            }
        >
            <InventoryForm initialData={mockPropertyData} isEdit={true} />
        </DashboardLayout>
    );
}
