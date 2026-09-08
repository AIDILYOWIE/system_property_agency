import { useState, useCallback, useEffect, useMemo } from "react";
import { Head } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import {
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    Home,
    Shield,
    TrendingUp,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    X,
    Calendar,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface DossierProperty {
    id: string;
    title: string;
    location: string;
    description: string;
    listingType: "For Sale" | "For Rent";
    category: string;
    price: number;
    currency: string;
    landSize: number | null;
    buildingSize: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    tenureType: string | null;
    leaseholdYears: number | null;
    projectedRoi: number | null;
    images: string[];
    mainThumbnail: string;
}

interface DossierAgent {
    name: string;
    title: string;
    phone: string;
    photo?: string;
}

interface DossierPageProps {
    property?: DossierProperty;
    agent?: DossierAgent;
}

// ─── Mock Data (akan diganti oleh Inertia props dari backend) ────────────────

const MOCK_PROPERTY: DossierProperty = {
    id: "prop-001",
    title: "Modern Villa Ubud",
    location: "Ubud, Bali",
    description:
        "Experience luxury living in the heart of Ubud. This modern villa features a spacious open-plan living area with floor-to-ceiling windows that frame the lush tropical jungle beyond. The private infinity pool seems to merge with the horizon, creating a seamless indoor-outdoor experience.\n\nBuilt with premium materials including imported Italian marble and reclaimed teak wood, every detail has been carefully considered. The smart home integration allows you to control lighting, climate, and security from your phone. Sustainable design principles including solar panels, rainwater harvesting, and natural ventilation ensure minimal environmental impact without compromising on luxury.\n\nThe property sits on an elevated plot offering panoramic views of the rice terraces and Ayung River valley — a view that will never be obstructed by future development. Just 15 minutes from central Ubud, yet completely secluded and private.",
    listingType: "For Sale",
    category: "Villa",
    price: 850000,
    currency: "USD",
    landSize: 350,
    buildingSize: 200,
    bedrooms: 3,
    bathrooms: 3,
    tenureType: "Leasehold",
    leaseholdYears: 25,
    projectedRoi: 12.5,
    images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    ],
    mainThumbnail:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
};

const MOCK_AGENT: DossierAgent = {
    name: "Chris",
    title: "Principal Agent · Chris Property Signature",
    phone: "628123456789",
};

// ─── Hoisted helpers (pure, no closure deps) ─────────────────────────────────

function formatPrice(price: number, currency: string): string {
    if (currency === "USD") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

function getTenureLabel(type: string | null, years: number | null): string {
    if (!type) return "—";
    if (type.toLowerCase() === "freehold" || type === "SHM") return "Freehold (SHM)";
    if (years) return `${type} (${years} Years)`;
    return type;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function DossierPage({ property, agent }: DossierPageProps) {
    const data = property ?? MOCK_PROPERTY;
    const agentData = agent ?? MOCK_AGENT;

    // ── Gallery state ─────────────────────────────────────────────────────────
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [heroLoaded, setHeroLoaded] = useState(false);

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = "hidden";
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
        document.body.style.overflow = "auto";
    }, []);

    const nextImage = useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setLightboxIndex((prev) => (prev + 1) % data.images.length);
        },
        [data.images.length]
    );

    const prevImage = useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setLightboxIndex(
                (prev) => (prev - 1 + data.images.length) % data.images.length
            );
        },
        [data.images.length]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

    // ── CTA WhatsApp URL ──────────────────────────────────────────────────────
    const ctaWhatsAppUrl = useMemo(
        () =>
            getWhatsAppUrl({
                phone: agentData.phone,
                clientName: "",
                propertyNames: [data.title],
                agentName: agentData.name,
            }).replace(
                /text=.*/,
                `text=${encodeURIComponent(
                    `Halo ${agentData.name}, saya tertarik untuk menjadwalkan private viewing untuk ${data.title} di ${data.location}. Apakah bisa diatur waktunya?`
                )}`
            ),
        [agentData, data.title, data.location]
    );

    // ── Spec items ────────────────────────────────────────────────────────────
    const specs = useMemo(() => {
        const items: { icon: React.ReactNode; label: string; value: string }[] = [];
        if (data.bedrooms != null) {
            items.push({ icon: <BedDouble size={18} />, label: "Bedrooms", value: `${data.bedrooms} Beds` });
        }
        if (data.bathrooms != null) {
            items.push({ icon: <Bath size={18} />, label: "Bathrooms", value: `${data.bathrooms} Baths` });
        }
        if (data.landSize != null) {
            items.push({ icon: <Maximize size={18} />, label: "Land Size", value: `${data.landSize} m²` });
        }
        if (data.buildingSize != null) {
            items.push({ icon: <Home size={18} />, label: "Building", value: `${data.buildingSize} m²` });
        }
        return items;
    }, [data.bedrooms, data.bathrooms, data.landSize, data.buildingSize]);

    return (
        <>
            <Head title={`${data.title} — Private Dossier`} />

            {/* ═══════════════════════════════════════════════════════════════
                DOSSIER PAGE — Distraction-Free Layout (no sidebar/navbar)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="min-h-screen bg-white font-sans">

                {/* ── Hero Section ──────────────────────────────────────────── */}
                <section className="relative w-full h-[55vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
                    {/* Background image */}
                    <img
                        src={data.mainThumbnail}
                        alt={data.title}
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                            heroLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                        )}
                        onLoad={() => setHeroLoaded(true)}
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 pb-10 sm:pb-14">
                            {/* Confidential badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-5">
                                <Shield size={12} className="text-white/80" />
                                <span className="text-[10px] font-semibold text-white/90 uppercase tracking-[0.15em]">
                                    Private Dossier · Confidential
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-3">
                                {data.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                                    <MapPin size={14} className="flex-shrink-0" />
                                    {data.location}
                                </span>
                                <span className="text-white/30">·</span>
                                <span className="text-white/80 text-sm font-medium">
                                    {data.category}
                                </span>
                                <span className="text-white/30">·</span>
                                <span className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-md uppercase tracking-wide">
                                    {data.listingType}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Main Content ──────────────────────────────────────────── */}
                <div className="max-w-5xl mx-auto px-6 sm:px-10 -mt-6 relative z-10">

                    {/* ── Executive Summary Card ───────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-border-base shadow-card p-6 sm:p-8 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-8">

                            {/* Price & type */}
                            <div className="flex-1">
                                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em] mb-2">
                                    Asking Price
                                </p>
                                <p className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-none mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {formatPrice(data.price, data.currency)}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-[#EAF3EF] text-[#0A5F41] uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0A5F41]" />
                                        {data.listingType === "For Sale" ? "For Sale" : "For Rent"}
                                    </span>
                                    {data.tenureType && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
                                            <Shield size={10} />
                                            {getTenureLabel(data.tenureType, data.leaseholdYears)}
                                        </span>
                                    )}
                                    {data.projectedRoi != null && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wide">
                                            <TrendingUp size={10} />
                                            ROI {data.projectedRoi}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Spec grid */}
                            <div className="grid grid-cols-2 gap-3 lg:w-[340px] flex-shrink-0">
                                {specs.map((spec) => (
                                    <div
                                        key={spec.label}
                                        className="flex items-center gap-3 bg-canvas p-3.5 rounded-xl border border-border-base"
                                    >
                                        <div className="text-[#0A5F41]">{spec.icon}</div>
                                        <div>
                                            <p className="text-[9px] text-text-muted font-semibold uppercase tracking-wider">
                                                {spec.label}
                                            </p>
                                            <p className="text-sm font-bold text-text-primary">
                                                {spec.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Description ───────────────────────────────────────── */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 rounded-full bg-[#0A5F41]" />
                            About This Property
                        </h2>
                        <div className="text-sm text-text-secondary leading-[1.8] whitespace-pre-line max-w-3xl">
                            {data.description}
                        </div>
                    </div>

                    {/* ── Gallery Grid ──────────────────────────────────────── */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 rounded-full bg-[#0A5F41]" />
                            Gallery
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {data.images.map((src, idx) => (
                                <div
                                    key={src}
                                    onClick={() => openLightbox(idx)}
                                    className={cn(
                                        "relative rounded-xl overflow-hidden cursor-pointer group",
                                        idx === 0 && "sm:col-span-2 sm:row-span-2"
                                    )}
                                >
                                    <img
                                        src={src}
                                        alt={`${data.title} — ${idx + 1}`}
                                        className={cn(
                                            "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                                            idx === 0 ? "h-48 sm:h-full" : "h-36 sm:h-48"
                                        )}
                                        loading={idx === 0 ? "eager" : "lazy"}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                    {/* "More" overlay on last visible thumbnail */}
                                    {idx === data.images.length - 1 && data.images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-white font-bold text-lg">
                                                +{data.images.length - 3}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Investor Details ──────────────────────────────────── */}
                    {(data.tenureType || data.projectedRoi != null) && (
                        <div className="mb-10">
                            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 rounded-full bg-[#0A5F41]" />
                                Investor Details
                            </h2>
                            <div className="bg-gradient-to-br from-[#032E1E] via-[#074831] to-[#0A5F41] rounded-2xl p-6 sm:p-8 text-white">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold mb-1.5">
                                            Title Status
                                        </p>
                                        <p className="text-base font-bold">
                                            {getTenureLabel(data.tenureType, data.leaseholdYears)}
                                        </p>
                                    </div>
                                    {data.projectedRoi != null && (
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold mb-1.5">
                                                Projected ROI
                                            </p>
                                            <p className="text-base font-bold text-[#52A77A]">
                                                {data.projectedRoi}% / Year
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-semibold mb-1.5">
                                            Category
                                        </p>
                                        <p className="text-base font-bold">
                                            {data.category}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer CTA ───────────────────────────────────────────── */}
                <footer className="border-t border-border-base bg-canvas mt-6">
                    <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            {/* Agent profile */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-[#0A5F41] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 border-2 border-[#0A5F41]/20">
                                    {agentData.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-text-primary">
                                        {agentData.name}
                                    </p>
                                    <p className="text-xs text-text-muted font-medium">
                                        {agentData.title}
                                    </p>
                                </div>
                            </div>

                            {/* CTA button */}
                            <a
                                href={ctaWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2.5 bg-[#0A5F41] hover:bg-[#074831] text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-colors duration-200 active:scale-[0.98] shadow-sm"
                            >
                                <MessageCircle size={18} className="stroke-[2.5]" />
                                Schedule a Private Viewing
                            </a>
                        </div>

                        {/* Footer note */}
                        <div className="mt-8 pt-6 border-t border-border-base">
                            <p className="text-[11px] text-text-muted leading-relaxed max-w-xl">
                                This document is a confidential private dossier prepared exclusively for the intended recipient.
                                Please do not share or distribute without the consent of{" "}
                                <span className="font-semibold text-text-secondary">Chris Property Signature</span>.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── Lightbox Modal ────────────────────────────────────────────── */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md z-10"
                    >
                        <X size={24} />
                    </button>

                    {/* Prev */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 lg:p-4 rounded-full backdrop-blur-md z-10"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    {/* Next */}
                    <button
                        onClick={nextImage}
                        className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 lg:p-4 rounded-full backdrop-blur-md z-10"
                    >
                        <ChevronRight size={28} />
                    </button>

                    {/* Image container */}
                    <div
                        className="max-w-6xl w-full h-full p-4 lg:p-12 flex flex-col items-center justify-center relative"
                        onClick={closeLightbox}
                    >
                        <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
                            {data.images.map((src, index) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`${data.title} — ${index + 1}`}
                                    className={cn(
                                        "max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-all duration-300 absolute",
                                        index === lightboxIndex
                                            ? "opacity-100 scale-100 relative"
                                            : "opacity-0 scale-95 pointer-events-none"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ))}
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-medium tracking-widest border border-white/10">
                            {lightboxIndex + 1} / {data.images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
