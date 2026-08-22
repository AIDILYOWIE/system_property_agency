import DashboardLayout from "@/Layouts/DashboardLayout";
import { Plus, Share } from "lucide-react";
import InventoryTable from "./Partials/InventoryTable";
import { router } from "@inertiajs/react";

export default function Inventory() {
    return (
        <DashboardLayout
            pageTitle="Inventory"
            pageDescription="Manage your property listings, track stale properties, and monitor performance."
            action={
                <div className="flex gap-2">
                    <button className="btn btn-secondary">
                        <Share size={18} />
                        Export
                    </button>
                    <button onClick={() => router.visit(route('inventory.add'))} className="btn btn-primary">
                        <Plus size={18} />
                        Add Property
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-6 pt-2">
                <InventoryTable />
            </div>
        </DashboardLayout>
    );
}