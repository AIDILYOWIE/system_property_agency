import DashboardLayout from "@/Layouts/DashboardLayout";
import { Plus, Download } from "lucide-react";
import SellerTable from "./Partials/SellerTable";
import { router } from "@inertiajs/react";
import { type SellerData } from "./Partials/SellerColumn";

export default function Seller({ sellers }: { sellers: SellerData[] }) {
    return (
        <DashboardLayout
            pageTitle="Seller Pipeline"
            pageDescription="Manage your property owners pipeline — track incoming leads, properties, and verification process."
            action={
                <div className="flex gap-2">
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => router.visit(route("seller.create"))}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        Add Seller
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-6 pt-2">
                <SellerTable data={sellers} />
            </div>
        </DashboardLayout>
    );
}
