import DashboardLayout from "@/Layouts/DashboardLayout";
import { Plus, Download } from "lucide-react";
import CustomerTable from "./Partials/CustomerTable";
import { router } from "@inertiajs/react";

export default function Customer() {
    return (
        <DashboardLayout
            pageTitle="Customers"
            pageDescription="Manage your CRM pipeline — track buyer leads, renters, and Open Slot partnership requests."
            action={
                <div className="flex gap-2">
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => router.visit(route("customer.add"))}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        Add Customer
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-6 pt-2">
                <CustomerTable />
            </div>
        </DashboardLayout>
    );
}
