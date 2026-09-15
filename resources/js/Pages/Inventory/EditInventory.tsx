"use client";

import { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Check } from "lucide-react";
import InventoryForm from "./Partials/InventoryForm";

export default function EditInventory({ property, facilitiesMaster }: { property: any, facilitiesMaster: any[] }) {

    const mappedInitialData = {
        id: property.id,
        title: property.title,
        location: property.location,
        full_address: property.full_address,
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
        marketing_start_date: property.marketing_start_date,
        social_media_1: property.social_media_1,
        social_media_2: property.social_media_2,
        facilities: property.facilities ? Object.values(property.facilities).flat().map((f: any) => f.id) : [],
    };

    return (
        <DashboardLayout
            pageTitle="Edit Property"
            pageDescription="Update the details of your property listing."
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
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        Publish
                    </button>
                </div>
            }
        >
            <InventoryForm initialData={mappedInitialData} isEdit={true} propertyId={property.id} facilitiesMaster={facilitiesMaster} />
        </DashboardLayout>
    );
}
