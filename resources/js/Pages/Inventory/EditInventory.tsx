"use client";

import { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Check } from "lucide-react";
import InventoryForm from "./Partials/InventoryForm";

export default function EditInventory({ property }: { property: any }) {

    const mappedInitialData = {
        id: property.id,
        title: property.title,
        location: property.location,
        description: property.description,
        price: property.price?.toString() ?? "",
        currency: property.currency,
        landSize: property.specification?.land_size?.toString() ?? "",
        buildingSize: property.specification?.building_size?.toString() ?? "",
        bedrooms: property.specification?.bedrooms?.toString() ?? "",
        bathrooms: property.specification?.bathrooms?.toString() ?? "",
        listingType: (property.listingType === "For Sale" ? "sale" : "rent") as any,
        category: (property.category?.toLowerCase().replace(/ /g, "_") || "") as any,
        titleStatus: (property.dossier?.tenure?.toLowerCase().includes("leasehold") ? "leasehold" : "freehold") as any,
        leaseholdYears: property.dossier?.tenure?.replace(/[^0-9]/g, "") ?? "",
        projectedRoi: property.dossier?.roi ? property.dossier.roi.toString() : "",
        zoning: (property.dossier?.zoning?.toLowerCase().includes("yellow") ? "yellow"
            : property.dossier?.zoning?.toLowerCase().includes("commercial") ? "commercial"
                : property.dossier?.zoning?.toLowerCase().includes("green") ? "green"
                    : property.dossier?.zoning?.toLowerCase().includes("pink") ? "pink" : "") as any,
        images: property.images || [],
    };

    return (
        <DashboardLayout
            pageTitle="Edit Property"
            pageDescription="Update the details of your property listing."
            action={
                <div className="flex" >
                    <button
                        type="submit"
                        form="inventory-form"
                        className="btn btn-primary"
                    >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        Save
                    </button>
                </div>
            }
        >
            <InventoryForm initialData={mappedInitialData} isEdit={true} propertyId={property.id} />
        </DashboardLayout>
    );
}
