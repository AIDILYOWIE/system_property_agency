"use client";

import DashboardLayout from "@/Layouts/DashboardLayout";
import { Check, UserPlus } from "lucide-react";
import CustomerForm from "./_Partials/CustomerForm";

export default function AddCustomer() {
    function handleSaveDraft() {
        console.log("Save customer as Draft");
    }

    return (
        <DashboardLayout
            pageTitle="Add New Customer"
            pageDescription="Register a new customer and assign them to the correct CRM pipeline."
            action={
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="btn btn-secondary"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        form="customer-form"
                        className="btn btn-primary"
                    >
                        <Check size={15} strokeWidth={2.5} />
                        Save Customer
                    </button>
                </div>
            }
        >
            <CustomerForm />
        </DashboardLayout>
    );
}
