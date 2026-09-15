import DashboardLayout from "@/Layouts/DashboardLayout";
import { useState, useMemo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Link, router, usePage } from "@inertiajs/react";
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
    Building2,
    Pencil,
    Check,
    X,
    Globe,
    Tag,
    Activity,
    FileText,
    Plus,
    MapPin,
    ArrowUpDown,
    BadgeCheck,
    PlusIcon,
    Layers,
    CheckCircle2,
    LayoutList,
    Clock,
} from "lucide-react";
import PropertyInterestCard from "@/Components/PropertyInterestCard";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PipelineStatus = "incoming" | "surveyed" | "agreed" | "listed" | "rejected";

type SellerProperty = {
    id: string;
    title: string;
    category: string;
    listing_type: "sale" | "rent";
    price?: number | null;
    currency?: "IDR" | "USD";
    full_address?: string | null;
    description?: string | null;
    seller_pipeline_status: PipelineStatus;
    created_at: string;
    images?: { image_path: string }[];
    status?: "available" | "sold" | "rented" | string;
};

type Seller = {
    id: string;
    name: string;
    phone: string;
    email?: string;
    source: string;
    notes: string;
    created_at: string;
    properties?: SellerProperty[];
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, "");
    if (clean.startsWith("62")) {
        const local = clean.slice(2);
        return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
    }
    return phone;
}


const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
    });

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DetailSeller({
    seller,
    properties,
}: {
    seller: Seller;
    properties: SellerProperty[];
}) {
    // Notes inline editable
    const [notes, setNotes] = useState(seller.notes ?? "");
    const [editingNotes, setEditingNotes] = useState(false);
    const [draftNotes, setDraftNotes] = useState(seller.notes ?? "");
    const notesRef = useRef<HTMLTextAreaElement>(null);

    // Check flash for post-create prompt
    const { props: pageProps } = usePage<any>();
    const flash = pageProps?.flash as { success?: string } | undefined;
    const isPostCreate = flash?.success?.includes("Tambahkan properti");

    const initials = useMemo(
        () =>
            seller.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase(),
        [seller.name]
    );

    const waUrl = getWhatsAppUrl({
        phone: seller.phone,
        clientName: seller.name,
        customerType: "property_owner",
    });

    const handleSaveNotes = useCallback(() => {
        router.patch(route("seller.show", { seller: seller.id }), { notes: draftNotes }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotes(draftNotes);
                setEditingNotes(false);
            },
        });
    }, [draftNotes, seller.id]);

    const handleCancelNotes = useCallback(() => {
        setDraftNotes(notes);
        setEditingNotes(false);
    }, [notes]);

    const daysActive = Math.floor(
        (Date.now() - new Date(seller.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const activeProperties = properties.filter(
        (p) => p.seller_pipeline_status !== "listed" && p.seller_pipeline_status !== "rejected"
    ).length;

    return (
        <DashboardLayout
            pageTitle={seller.name}
            pageDescription={`Seller Profile · ${seller.source}`}
            action={
                <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Edit2 className="w-4 h-4 stroke-[2.5]" />
                        Edit
                    </button>
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                        WhatsApp
                    </a>
                </div>
            }
        >
            {/* ── Breadcrumb ─────────────────────────────────────────── */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/seller" />}>
                            All Seller
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{seller.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* ── Post-Create Prompt ─────────────────────────────────────── */}
            {isPostCreate && (
                <div className="flex items-center gap-4 px-5 py-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
                    <BadgeCheck size={18} className="text-primary flex-shrink-0" />
                    <p className="text-sm text-text-primary flex-1">
                        <span className="font-semibold">Seller berhasil ditambahkan!</span>{" "}
                        Tambahkan properti pertama untuk mulai melacak di pipeline.
                    </p>
                    <Link
                        href={route('inventory.add', { seller_id: seller.id })}
                        className="btn btn-primary !py-2 !text-xs"
                    >
                        <PlusIcon size={13} />
                        Tambah
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ══════════════════════════════════════════════════
                    LEFT COLUMN (2/3): Profile + Properties + Timeline
                ══════════════════════════════════════════════════ */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* ── Zone 1: Profile Header Card ─────────────── */}
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
                                        {seller.name}
                                    </h2>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-teal-50 text-teal-600 border-teal-200">
                                        Owner
                                    </span>
                                </div>

                                {/* Contact row */}
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-text-muted">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Phone size={14} className="flex-shrink-0" />
                                        {formatPhone(seller.phone)}
                                    </span>
                                    {seller.email && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Mail size={14} className="flex-shrink-0" />
                                            {seller.email}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Globe size={14} className="flex-shrink-0" />
                                        {seller.source}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Calendar size={14} className="flex-shrink-0" />
                                        {formatDate(seller.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="my-6 border-t border-border-base" />

                        {/* Stats Row — Bedrooms-style cards (larger) */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Total Properties */}
                            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl border border-border-base">
                                <Building2 className="w-7 h-7 text-primary" />
                                <div>
                                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">Properties</p>
                                    <p className="text-2xl font-bold text-text-primary tabular-nums leading-tight">{properties.length}</p>
                                </div>
                            </div>

                            {/* Active in Pipeline */}
                            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl border border-border-base">
                                <LayoutList className="w-7 h-7 text-primary" />
                                <div>
                                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">Active</p>
                                    <p className="text-2xl font-bold text-text-primary tabular-nums leading-tight">{activeProperties}</p>
                                </div>
                            </div>

                            {/* Listed */}
                            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl border border-border-base">

                                <CheckCircle2 className="w-7 h-7 text-primary" />
                                <div>
                                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">Listed</p>
                                    <p className="text-2xl font-bold text-text-primary tabular-nums leading-tight">
                                        {properties.filter(p => p.seller_pipeline_status === "listed").length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Zone 2: Properties ──────────────────────── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card overflow-hidden flex flex-col">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-border-base">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Properties
                                </h2>
                                <p className="text-xs text-text-muted mt-1">
                                    {properties.length} properti ditawarkan
                                </p>
                            </div>
                            <Link
                                href={route('inventory.add', { seller_id: seller.id })}
                                className="text-xs font-semibold text-primary bg-[#EAF3EF] px-3 py-1.5 rounded-md hover:bg-[#EAF3EF]/80 transition-colors flex items-center gap-1"
                            >
                                <Plus size={12} className="stroke-[3]" /> Tambah
                            </Link>
                        </div>

                        <div className="divide-y divide-border-base">
                            {properties.length === 0 ? (
                                <div className="py-12 flex flex-col items-center text-center">
                                    <Building2 size={32} className="text-border-base mb-3" />
                                    <p className="text-sm font-medium text-text-muted">Belum ada properti</p>
                                    <Link
                                        href={route('inventory.add', { seller_id: seller.id })}
                                        className="mt-3 font-semibold text-xs text-primary text bg-[#EAF3EF] px-3 py-1.5 rounded-md hover:bg-[#EAF3EF]/80 transition-colors flex items-center gap-1"
                                    >
                                        <PlusIcon size={12} className="font-medium" /> Add Property
                                    </Link>
                                </div>
                            ) : (
                                properties.map((p) => {
                                    const waUrl = getWhatsAppUrl({
                                        phone: seller.phone,
                                        clientName: seller.name,
                                        customerType: "property_owner",
                                        propertyNames: [p.title]
                                    });

                                    return (
                                        <PropertyInterestCard
                                            key={p.id}
                                            property={{
                                                id: p.id,
                                                title: p.title,
                                                location: p.full_address || "-",
                                                price: p.price ?? null,
                                                currency: p.currency ?? "IDR",
                                                thumbnail: p.images?.[0]?.image_path
                                                    ? `/storage/${p.images[0].image_path}`
                                                    : "/images/placeholder-property.jpg",
                                                listingType: p.listing_type === "sale" ? "For Sale" : "For Rent",
                                                status: p.status || "available",
                                                pipelineStatus: p.seller_pipeline_status,
                                            }}
                                            action={
                                                <a
                                                    href={waUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0"
                                                    title="WhatsApp seller tentang properti ini"
                                                >
                                                    <MessageCircle size={14} />
                                                </a>
                                            }
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── Zone 3: Activity Timeline (placeholder) ─── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card overflow-hidden">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-border-base">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Activity Timeline
                                </h2>
                                <p className="text-xs text-text-muted mt-1">
                                    Riwayat otomatis tercatat — tidak dapat diedit
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-8 flex flex-col items-center justify-center text-center">
                            <Activity size={28} className="text-border-base mb-2" />
                            <p className="text-sm font-medium text-text-muted">Timeline akan tampil di sini</p>
                            <p className="text-xs text-text-muted/60 mt-1">Fitur ini akan dikembangkan pada US 4.3</p>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    RIGHT COLUMN (1/3): Notes
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-6">

                    {/* ── Zone 4: Notes (Inline Editable) ────────── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card overflow-hidden">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-border-base">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Notes
                            </h2>
                            {!editingNotes ? (
                                <button
                                    onClick={() => {
                                        setDraftNotes(notes);
                                        setEditingNotes(true);
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
                                    placeholder="Tambahkan catatan tentang seller ini..."
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
