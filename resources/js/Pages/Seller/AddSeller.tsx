import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Check } from "lucide-react";
import SellerForm from "./Partials/SellerForm";

export default function AddSeller() {
    // Basic trick to trigger re-renders or allow checking loading states if we were hoisting the button loading logic. 
    // Usually is processing is inside SellerForm, so we don't have to strictly bind it to the button outside if native HTML submit is used.

    return (
        <DashboardLayout
            pageTitle="Add Property Seller"
            pageDescription="Register a new property owner into the Seller Pipeline."
            action={
                <div className="flex gap-2">
                    <button
                        type="submit"
                        form="seller-form" // This binds to the form id inside SellerForm
                        className="btn btn-primary"
                    >
                        <Check size={15} strokeWidth={2.5} />
                        Save
                    </button>
                </div>
            }
        >
            <Head title="Add Seller" />
            <SellerForm formId="seller-form" />
        </DashboardLayout>
    );
}
