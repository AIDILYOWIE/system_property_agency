import { useState } from 'react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Settings, Building2 } from "lucide-react";
import FacilitiesManager from "./Facilities/FacilitiesManager";
import { Facility } from "./Facilities/column";

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabKey = 'general' | 'facilities';

const TABS: { key: TabKey; label: string; icon: typeof Settings; disabled?: boolean }[] = [
    { key: 'general', label: 'General', icon: Settings, disabled: true },
    { key: 'facilities', label: 'Facilities', icon: Building2 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsIndex({ facilities }: { facilities: Facility[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>('facilities');

    return (
        <DashboardLayout
            pageTitle="Settings"
            pageDescription="Pengaturan sistem dan manajemen konfigurasi"
        >
            <Head title="Settings" />

            {/* ── Header Card (title + tab nav) ───────────────────── */}
            <div className="mb-4 overflow-hidden">

                {/* Tab nav — underline style, flush to bottom of card */}
                <nav className="flex items-end gap-0 mt-4" aria-label="Settings tabs">
                    {TABS.map(({ key, label, icon: Icon, disabled }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={disabled}
                                onClick={() => !disabled && setActiveTab(key)}
                                aria-selected={isActive}
                                role="tab"
                                className={`
                                    relative flex items-center gap-2 px-4 py-3 text-sm font-semibold
                                    border-b-2 transition-colors duration-150 focus:outline-none
                                    disabled:opacity-30 disabled:pointer-events-none
                                    ${isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-text-muted hover:text-text-primary'
                                    }
                                `}
                            >
                                <Icon size={15} aria-hidden="true" />
                                {label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ── Content Card ────────────────────────────────────── */}
            <div role="tabpanel">
                {activeTab === 'general' && (
                    <div className="bg-white rounded-2xl border border-border-base shadow-card p-6 flex items-center justify-center min-h-[300px]">
                        <p className="text-sm text-text-muted">
                            Pengaturan General dalam tahap pengembangan.
                        </p>
                    </div>
                )}

                {activeTab === 'facilities' && (
                    <FacilitiesManager facilities={facilities} />
                )}
            </div>
        </DashboardLayout>
    );
}
