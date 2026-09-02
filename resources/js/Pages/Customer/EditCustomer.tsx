"use client";

import DashboardLayout from "@/Layouts/DashboardLayout";
import { Check, UserCog } from "lucide-react";
import { useRef, useMemo } from "react";
import { Link } from "@inertiajs/react";
import CustomerForm, { type FormState } from "./_Partials/CustomerForm";
import { type PropertyItem } from "@/Components/SelectSearch";

export default function EditCustomer({ customer, properties }: { customer: any, properties: PropertyItem[] }) {

    const initialData = useMemo<Partial<FormState>>(() => {
        return {
            fullName: customer.name,
            phone: customer.phone,
            email: customer.email || "",
            source: (customer.source || "").toLowerCase().replace(/\s+/g, '-'), // Basic normalization for select
            note: customer.notes || "",
            property_ids: customer.properties?.map((p: any) => p.id) || [],
        };
    }, [customer]);

    return (
        <DashboardLayout
            pageTitle="Edit Customer"
            pageDescription="Update customer contact information and profile data."
            action={
                <div className="flex gap-2">
                    <Link
                        href={`/customer/detail/${customer.id}`}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        form="customer-form"
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Check size={15} strokeWidth={2.5} />
                        Save Changes
                    </button>
                </div>
            }
        >
            <CustomerForm
                initialData={initialData}
                isEdit={true}
                formId="customer-form"
                customerId={customer.id}
                properties={properties}
            />
        </DashboardLayout>
    );
}
