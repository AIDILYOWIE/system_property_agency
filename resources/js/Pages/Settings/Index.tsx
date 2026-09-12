import React from 'react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { Settings, Building2 } from "lucide-react";
import FacilitiesManager from "./Facilities/FacilitiesManager";
import { Facility } from "./Facilities/column";

export default function SettingsIndex({ facilities }: { facilities: Facility[] }) {
    return (
        <DashboardLayout pageTitle="Settings" pageDescription="Pengaturan sistem dan manajemen konfigurasi">
            <Head title="Settings" />

            <div className="flex flex-col">
                <Tabs defaultValue="facilities" className="w-full">
                    {/* Tabs Header Area */}
                    <div className="border-b border-border-base mb-6">
                        <TabsList className="bg-transparent h-auto p-0 flex space-x-6 justify-start">
                            <TabsTrigger
                                value="general"
                                disabled
                                className="bg-transparent hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-3 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                General (BETA)
                            </TabsTrigger>
                            <TabsTrigger
                                value="facilities"
                                className="bg-transparent hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-3 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors"
                            >
                                <Building2 className="w-4 h-4 mr-2" />
                                Facilities
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tabs Content */}
                    <TabsContent value="general" className="mt-0 focus-visible:outline-none">
                        <div className="bg-white p-6 shadow-sm rounded-xl flex items-center justify-center min-h-[300px]">
                            <p className="text-gray-400 font-medium">Pengaturan General dalam tahap pengembangan.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="facilities" className="mt-0 focus-visible:outline-none">
                        <FacilitiesManager facilities={facilities} />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
