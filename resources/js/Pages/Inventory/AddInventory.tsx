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

// ─── Types ────────────────────────────────────────────────────────────────────

type ListingType = "sale" | "rent";
type Category =
    | "villas"
    | "premium_houses"
    | "strategic_land"
    | "commercial"
    | "";
type TitleStatus = "freehold" | "leasehold" | "";
type Currency = "IDR" | "USD";
type Partnership =
    | "commission"
    | "open_slot_1"
    | "open_slot_2"
    | "open_slot_3"
    | "";
type Zoning = "yellow" | "commercial" | "green" | "pink" | "";

interface FormState {
    title: string;
    location: string;
    description: string;
    price: string;
    currency: Currency;
    partnership: Partnership;
    landSize: string;
    buildingSize: string;
    bedrooms: string;
    bathrooms: string;
    listingType: ListingType;
    category: Category;
    titleStatus: TitleStatus;
    leaseholdYears: string;
    projectedRoi: string;
    zoning: Zoning;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AddInventory() {
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const [form, setForm] = useState<FormState>({
        title: "",
        location: "",
        description: "",
        price: "",
        currency: "USD",
        partnership: "",
        landSize: "",
        buildingSize: "",
        bedrooms: "",
        bathrooms: "",
        listingType: "sale",
        category: "",
        titleStatus: "",
        leaseholdYears: "",
        projectedRoi: "",
        zoning: "",
    });

    function handleSaveDraft() {
        // TODO: submit as draft
        console.log("Save as Draft", { ...form, status: "draft" });
    }

    function handlePublish(e: React.FormEvent) {
        e.preventDefault();
        // TODO: submit via Inertia router.post
        console.log("Publish Listing", { ...form, status: "available" });
    }

    return (
        <DashboardLayout
            pageTitle="Add New Property"
            pageDescription="Fill in the details to list a new property in your inventory."
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
                        Publish
                    </button>
                </div>
            }
        >
            <InventoryForm />
        </DashboardLayout>
    );
}
