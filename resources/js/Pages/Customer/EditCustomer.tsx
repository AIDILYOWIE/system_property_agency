"use client";

import DashboardLayout from "@/Layouts/DashboardLayout";
import { Check, UserCog } from "lucide-react";
import { useRef } from "react";
import { Link } from "@inertiajs/react";
import CustomerForm from "./_Partials/CustomerForm";

// ─── Mock: in production this would be fetched via usePage().props ──────────────

const MOCK_CUSTOMER_DATA = {
    fullName: "Pak Anton Wijaya",
    phone: "628123456789",
    email: "anton.wijaya@email.com",
    source: "instagram" as const,
    note: "Pak Anton sangat tertarik dengan vila bergaya modern minimalis. Budget fleksibel hingga $1M. Lebih suka lokasi Ubud atau Canggu, tidak mau Kuta. Hubungi pagi hari, jam 9–11.",
    propertyInterests: [],
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function EditCustomer() {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <DashboardLayout
            pageTitle="Edit Customer"
            pageDescription="Update customer contact information and profile data."
            action={
                <div className="flex gap-2">
                    <Link
                        href="/customer/detail/cust-001"
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
                initialData={MOCK_CUSTOMER_DATA}
                isEdit={true}
                formId="customer-form"
            />
        </DashboardLayout>
    );
}
