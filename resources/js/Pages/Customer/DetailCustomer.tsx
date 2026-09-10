import DashboardLayout from "@/Layouts/DashboardLayout";
import { useState, useMemo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Link, router } from "@inertiajs/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import {
    MessageCircle,
    Edit2,
    Phone,
    Mail,
    Calendar,
    ArrowRight,
    CheckCircle2,
    Clock,
    Building2,
    User,
    Home,
    Pencil,
    Check,
    X,
    Globe,
    Tag,
    Activity,
    FileText,
} from "lucide-react";
import { type PipelineStatus, type CustomerType } from "./_Partials/CustomerColumn";
import PipelineTracker from "../BuyerPipeline/_Partials/pipeline/PipelineTracker";
import PropertyInterestCard, { type PropertyInterestItem } from "@/Components/PropertyInterestCard";
import PropertyPickerModal from "./_Partials/PropertyPickerModal";
import WAPopupModal from "./_Partials/WAPopupModal";
import { type InventoryProperty } from "./_Partials/PropertyInterestRepeater";

// ─── Types ─────────────────────────────────────────────────────────────────────

// PropertyInterest is aliased from the shared component type
type PropertyInterest = PropertyInterestItem;

interface TimelineEvent {
    id: string;
    date: string;
    time: string;
    event: string;
    detail?: string;
    type: "status_change" | "contact" | "property" | "created" | "note";
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    customer_type: CustomerType;
    pipeline_status: PipelineStatus;
    source: string;
    utm_medium?: string | null;
    referrer?: string | null;
    notes: string;
    created_at: string;
    last_contacted?: string;
    properties: PropertyInterest[];
    timeline: TimelineEvent[];
    total_interaction: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
    // 628xxx → +62 812-3456-789
    const clean = phone.replace(/\D/g, "");
    if (clean.startsWith("62")) {
        const local = clean.slice(2);
        return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
    }
    return phone;
}

// ─── Status Config ──────────────────────────────────────────────────────────────

const PIPELINE_CONFIG: Record<PipelineStatus, { label: string; color: string; dot: string }> = {
    new_lead: { label: "New Lead", color: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
    contacted: { label: "Contacted", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
    viewing: { label: "Viewing", color: "bg-violet-50 text-violet-600 border-violet-200", dot: "bg-violet-500" },
    negotiation: { label: "Negotiation", color: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
    won: { label: "WON", color: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
    lost: { label: "LOST", color: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-500" },
    new_request: { label: "New Request", color: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
    qualifying: { label: "Qualifying", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
    awaiting_payment: { label: "Awaiting Payment", color: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
};

const CUSTOMER_TYPE_CONFIG: Record<CustomerType, { label: string; color: string; icon: React.ReactNode }> = {
    buyer: { label: "Buyer", color: "bg-sky-50 text-sky-600 border-sky-200", icon: <User size={12} /> },
    renter: { label: "Renter", color: "bg-purple-50 text-purple-600 border-purple-200", icon: <Home size={12} /> },
    property_owner: { label: "Property Owner", color: "bg-teal-50 text-teal-600 border-teal-200", icon: <Building2 size={12} /> },
};

const TIMELINE_ICON: Record<TimelineEvent["type"], React.ReactNode> = {
    status_change: <ArrowRight size={12} className="text-violet-500" />,
    contact: <MessageCircle size={12} className="text-emerald-500" />,
    property: <Building2 size={12} className="text-sky-500" />,
    created: <CheckCircle2 size={12} className="text-blue-500" />,
    note: <FileText size={12} className="text-amber-500" />,
};

const TIMELINE_DOT: Record<TimelineEvent["type"], string> = {
    status_change: "border-violet-300 bg-violet-50",
    contact: "border-emerald-300 bg-emerald-50",
    property: "border-sky-300 bg-sky-50",
    created: "border-blue-300 bg-blue-50",
    note: "border-amber-300 bg-amber-50",
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function DetailCustomer({ customer }: { customer: Customer }) {
    const [notes, setNotes] = useState(customer.notes);
    const [editingNotes, setEditingNotes] = useState(false);
    const [draftNotes, setDraftNotes] = useState(customer.notes);
    const notesRef = useRef<HTMLTextAreaElement>(null);

    // ── Property picker state ─────────────────────────────────────────────────
    const [properties, setProperties] = useState<PropertyInterest[]>(customer.properties);
    const [pickerOpen, setPickerOpen] = useState(false);

    // WA Modal State
    const [waModalOpen, setWaModalOpen] = useState(false);

    // IDs currently in the list — passed as disabledIds to avoid double-picking
    const selectedPropertyIds = useMemo(
        () => properties.map((p) => p.id),
        [properties]
    );

    // Map InventoryProperty → PropertyInterest shape used by the detail card
    const handlePropertySelect = useCallback((inv: InventoryProperty) => {
        const mapped: PropertyInterest = {
            id: inv.id,
            title: inv.title,
            location: inv.location,
            price: inv.price,
            currency: inv.currency,
            thumbnail: inv.thumbnail,
            listingType: inv.listingType,
            status: inv.status === "draft" ? "available" : inv.status,
            pipelineStatus: "new_lead",
        };
        setProperties((prev) => [...prev, mapped]);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────

    const pipelineConfig = PIPELINE_CONFIG[customer.pipeline_status];
    const typeConfig = CUSTOMER_TYPE_CONFIG[customer.customer_type];

    const initials = useMemo(
        () =>
            customer.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase(),
        [customer.name]
    );

    const handleSaveNotes = useCallback(() => {
        router.patch(`/customer/detail/${customer.id}/notes`, { notes: draftNotes }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotes(draftNotes);
                setEditingNotes(false);
            },
        });
    }, [draftNotes, customer.id]);

    const handleCancelNotes = useCallback(() => {
        setDraftNotes(notes);
        setEditingNotes(false);
    }, [notes]);

    const handleWaProceed = (selectedIds: string[]) => {
        setWaModalOpen(false);
        const selectedProps = properties.filter(p => selectedIds.includes(p.id));
        const propertyNames = selectedProps.map(p => p.title);

        // Target WA URL
        const waUrl = getWhatsAppUrl({
            phone: customer.phone,
            clientName: customer.name,
            customerType: customer.customer_type,
            propertyNames: customer.customer_type !== "property_owner" ? propertyNames : undefined,
        });

        // Backend Sync & redirect to WA
        router.post(`/customer/detail/${customer.id}/follow-up`, { property_ids: selectedIds }, {
            preserveScroll: true,
        });

        window.open(waUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <DashboardLayout
            pageTitle={customer.name}
            pageDescription={`${typeConfig.label} · ${pipelineConfig.label}`}
            action={
                <div className="flex gap-2">

                    <Link
                        href={`/customer/edit/${customer.id}`}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4 stroke-[2.5]" />
                        Edit
                    </Link>
                    <button
                        onClick={() => {
                            if (customer.properties.length > 1) {
                                setWaModalOpen(true);
                            } else {
                                // Default array
                                const ids = customer.properties.filter(p => p.pipelineStatus !== "lost" && p.pipelineStatus !== "won").map(p => p.id);
                                handleWaProceed(ids);
                            }
                        }}
                        className="btn btn-primary flex items-center"
                    >
                        <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                        One-Click WA
                    </button>
                </div>
            }
        >
            {/* ── Breadcrumb ─────────────────────────────────────────── */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/customer" />}>
                            Customers
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{customer.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <WAPopupModal
                open={waModalOpen}
                onClose={() => setWaModalOpen(false)}
                properties={customer.properties}
                onProceed={handleWaProceed}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ══════════════════════════════════════════════════════
                    LEFT COLUMN (2/3): Header + Properties + Timeline
                ══════════════════════════════════════════════════════ */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* ── Zone 1: Profile Header Card ───────────────── */}
                    <div className="bg-white rounded-2xl p-6 border border-border-base shadow-card">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-2xl flex-shrink-0 select-none">
                                {initials}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h2 className="text-xl font-bold text-text-primary">
                                        {customer.name}
                                    </h2>
                                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", typeConfig.color)}>
                                        {typeConfig.icon}
                                        {typeConfig.label}
                                    </span>
                                </div>

                                {/* Contact row */}
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-text-muted">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Phone size={14} className=" flex-shrink-0" />
                                        {formatPhone(customer.phone)}
                                    </span>
                                    {customer.email && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Mail size={14} className=" flex-shrink-0" />
                                            {customer.email}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Globe size={14} className="flex-shrink-0" />
                                        {customer.source}
                                    </span>
                                    {customer.utm_medium && (
                                        <span className="flex items-center gap-1.5 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                            utm_medium: <span className="font-bold">{customer.utm_medium}</span>
                                        </span>
                                    )}
                                    {customer.referrer && (
                                        <span className="flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                            referrer: <span className="font-bold truncate max-w-[150px]" title={customer.referrer}>{customer.referrer}</span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Calendar size={14} className="flex-shrink-0" />
                                        {new Date(customer.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="my-6 border-t border-border-base" />

                        {/* Pipeline Stage Tracker */}
                        <div>
                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">
                                Pipeline Progress
                            </p>
                            <PipelineTracker
                                customerType={customer.customer_type}
                                currentStatus={customer.pipeline_status}
                            />
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-canvas rounded-xl p-4 border border-border-base text-center flex flex-col justify-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Properties</p>
                                <p className="text-2xl font-bold text-text-primary leading-none">{customer.properties.length}</p>
                            </div>
                            <div className="bg-canvas rounded-xl p-4 border border-border-base text-center flex flex-col justify-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Interactions</p>
                                <p className="text-2xl font-bold text-text-primary leading-none">{customer.total_interaction}</p>
                            </div>
                            <div className="bg-canvas rounded-xl p-4 border border-border-base text-center flex flex-col justify-center">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Days Active</p>
                                <p className="text-2xl font-bold text-text-primary leading-none">
                                    {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Zone 2: Property Interests ────────────────── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card overflow-hidden flex flex-col">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-border-base">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />{" "}
                                    Interested Property
                                </h2>
                                <p className="text-xs text-text-muted mt-1">
                                    {properties.length} properti
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPickerOpen(true)}
                                className="text-xs font-semibold text-primary bg-[#EAF3EF] px-3 py-1.5 rounded-md hover:bg-[#EAF3EF]/80 transition-colors"
                            >
                                + Tambah
                            </button>
                        </div>

                        <div className="divide-y divide-border-base">
                            {properties.length === 0 ? (
                                <div className="py-12 flex flex-col items-center text-center">
                                    <Building2 size={32} className="text-border-base mb-3" />
                                    <p className="text-sm font-medium text-text-muted">Belum ada properti yang ditautkan</p>
                                </div>
                            ) : (
                                properties.map((property) => (
                                    <PropertyInterestCard key={property.id} property={property} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Property Picker Modal ─────────────────────── */}
                    <PropertyPickerModal
                        open={pickerOpen}
                        onClose={() => setPickerOpen(false)}
                        onSelect={handlePropertySelect}
                        selectedId={null}
                        disabledIds={selectedPropertyIds}
                    />

                    {/* ── Zone 3: Activity Timeline ─────────────────── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card overflow-hidden">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-border-base">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />{" "}
                                    Activity Timeline
                                </h2>
                                <p className="text-xs text-text-muted mt-1">
                                    Riwayat otomatis tercatat — tidak dapat diedit
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            {customer.timeline.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-8">Belum ada aktivitas</p>
                            ) : (
                                <ol className="relative border-l border-border-base ml-2.5 flex flex-col gap-0">
                                    {customer.timeline.map((event, idx) => (
                                        <li key={event.id} className="relative mb-6 ml-5 last:mb-0">
                                            {/* Timeline dot */}
                                            <span className={cn(
                                                "absolute -left-[33px] flex w-6 h-6 items-center justify-center rounded-full border-2 bg-white",
                                                TIMELINE_DOT[event.type]
                                            )}>
                                                {TIMELINE_ICON[event.type]}
                                            </span>
                                            <div className="bg-canvas rounded-xl p-4 border border-border-base">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                                    <p className="text-[13px] font-bold text-text-primary">{event.event}</p>
                                                    <p className="text-[11px] text-text-muted flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded-md border border-border-base">
                                                        <Clock size={10} />
                                                        {event.date} · {event.time}
                                                    </p>
                                                </div>
                                                {event.detail && (
                                                    <p className="text-[12px] text-text-muted leading-relaxed">{event.detail}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════
                    RIGHT COLUMN (1/3): Status + WA + Notes
                ══════════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-6">


                    {/* ── Zone 4: Notes (Inline Editable) ──────────── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card overflow-hidden">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-border-base">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />{" "}
                                Notes
                            </h2>
                            {!editingNotes ? (
                                <button
                                    onClick={() => {
                                        setDraftNotes(notes);
                                        setEditingNotes(true);
                                        // Focus after render
                                        setTimeout(() => notesRef.current?.focus(), 50);
                                    }}
                                    className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted hover:text-primary transition-colors"
                                >
                                    <Pencil size={14} />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCancelNotes}
                                        className="flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveNotes}
                                        className="flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Check size={14} />
                                        Simpan
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            {editingNotes ? (
                                <textarea
                                    ref={notesRef}
                                    value={draftNotes}
                                    onChange={(e) => setDraftNotes(e.target.value)}
                                    rows={6}
                                    placeholder="Tambahkan catatan tentang klien ini..."
                                    className="w-full resize-none rounded-xl border border-border-base bg-canvas px-3.5 py-3 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/40 transition-colors leading-relaxed"
                                />
                            ) : notes ? (
                                <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                                    {notes}
                                </p>
                            ) : (
                                <p className="text-[13px] text-text-muted/60 italic">
                                    Belum ada catatan. Klik Edit untuk menambahkan.
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}


