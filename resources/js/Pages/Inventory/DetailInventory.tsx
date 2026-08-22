import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    ChevronLeft,
    AlertCircle,
    Users,
    Edit2,
    Link as LinkIcon,
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    Home,
    LockKeyhole,
    TrendingUp,
    UserX,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";
import { CardPrimary, CardPrimaryHeader, CardPrimaryContent } from "@/Components/CardPrimary";
import { DataTable } from "@/Components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/Components/ui/table-data-features";
import { Switch } from "@/Components/ui/switch";
import { toast } from "@/Components/ui/toast";

type ClientData = {
    id: string;
    client: string;
    status: string;
    source: string;
    lastActivity: string;
    aksi?: boolean;
}

const mockClients: ClientData[] = [];

const clientColumns: ColumnDef<DataTableFeatures, ClientData>[] = [
    {
        accessorKey: "client",
        header: "Client",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "source",
        header: "Source & Notes",
    },
    {
        accessorKey: "lastActivity",
        header: "Last Activity",
    },
    {
        id: "aksi",
        header: () => <div className="text-right">Aksi</div>,
        cell: () => null,
    }
];

export default function DetailInventory() {
    const [isPublic, setIsPublic] = useState(true);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const propertyImages = [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    ];

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setGalleryOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeGallery = () => {
        setGalleryOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    };

    const handlePublicToggle = (checked: boolean) => {
        setIsPublic(checked);
        toast.add({
            title: checked ? "Berhasil dipublikasikan" : "Status diubah",
            description: checked
                ? "Properti ini sekarang dapat dilihat oleh publik."
                : "Properti ini diturunkan (Draft) dan disembunyikan.",
            type: checked ? "success" : "info" as any, // fallback for typescript checking
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!galleryOpen) return;
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [galleryOpen]);

    return (
        <>
            <DashboardLayout pageTitle="Modern Villa Ubud"
                pageDescription="Ubud, Bali • Ditambahkan 65 hari yang lalu"
                action={
                    <div className="flex gap-2">
                        <div className="flex gap-2 items-center w-[100px]">
                            <Switch
                                id="isPublic"
                                checked={isPublic}
                                onCheckedChange={handlePublicToggle}
                            />
                            <label htmlFor="isPublic" className="text-sm font-semibold text-text-primary cursor-pointer">Public</label>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                        >
                            <Edit2 className="w-4 h-4 stroke-[2.5]" />
                            Edit
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <LinkIcon className="w-4 h-4 stroke-[2.5]" />
                            Salin Secret Link
                        </button>
                    </div>
                }
            >
                <div>
                    {/* Stale Property Alert Banner */}
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                                <AlertCircle className="w-5 h-5 fill-current text-red-100 stroke-red-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-800">
                                    Stale Listing Detected
                                </h4>
                                <p className="text-xs text-red-600 mt-0.5">
                                    Properti ini telah tayang lebih dari 60 hari
                                    namun belum mendapatkan lead sama sekali (0 Lead).
                                    Pertimbangkan untuk mengevaluasi strategi
                                    pemasaran.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Media & Clients */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="bg-white rounded-2xl p-4 shadow-card border border-border-base">
                                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[320px]">
                                    {/* Main Image */}
                                    <div
                                        className="col-span-3 row-span-2 rounded-xl overflow-hidden relative group cursor-pointer z-0"
                                        onClick={() => openGallery(0)}
                                    >
                                        <img
                                            src={propertyImages[0]}
                                            alt="Villa"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    {/* Thumbnails */}
                                    <div
                                        className="col-span-1 row-span-1 rounded-xl overflow-hidden relative group cursor-pointer"
                                        onClick={() => openGallery(1)}
                                    >
                                        <img
                                            src={propertyImages[1]}
                                            alt="Interior"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div
                                        className="col-span-1 row-span-1 rounded-xl overflow-hidden relative group cursor-pointer"
                                        onClick={() => openGallery(2)}
                                    >
                                        <img
                                            src={propertyImages[2]}
                                            alt="Pool"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-sm backdrop-blur-[1px] hover:bg-black/50 transition-colors">
                                            +{Math.max(0, propertyImages.length - 2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Analytic Card (Mobile View) */}
                            <div className="bg-white rounded-2xl p-5 shadow-card border border-border-base flex lg:hidden items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-red-500 uppercase font-semibold mb-1">
                                        Total Leads
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 leading-none">
                                        0
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-border-base"></div>
                                <div>
                                    <p className="text-[11px] text-red-500 uppercase font-semibold mb-1">
                                        Days on Market
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 leading-none">
                                        65
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-border-base"></div>
                                <div>
                                    <p className="text-[11px] text-text-muted uppercase font-semibold mb-1">
                                        Views
                                    </p>
                                    <p className="text-2xl font-bold text-text-primary leading-none">
                                        42
                                    </p>
                                </div>
                            </div>

                            <DataTable
                                columns={clientColumns as any}
                                data={mockClients}
                                headerSlot={
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                <Users className="w-5 h-5 fill-current text-primary" />{" "}
                                                Interested Clients
                                            </h2>
                                            <p className="text-xs text-text-muted mt-1">
                                                Daftar client / leads yang sedang
                                                memproses properti ini.
                                            </p>
                                        </div>
                                        <button className="text-xs font-semibold text-primary bg-[#EAF3EF] px-3 py-1.5 rounded-md hover:bg-[#EAF3EF]/80 transition-colors">
                                            + Tambah Client
                                        </button>
                                    </div>
                                }
                            />
                        </div>

                        {/* Right Column: Property Info & Dossier */}
                        <div className="flex flex-col gap-6">
                            {/* Performance Analytic Card (Desktop View) */}
                            <div className="bg-white rounded-2xl p-5 shadow-card border border-border-base hidden lg:flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-red-500 uppercase font-semibold mb-1">
                                        Total Leads
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 leading-none">
                                        0
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-border-base"></div>
                                <div>
                                    <p className="text-[11px] text-red-500 uppercase font-semibold mb-1">
                                        Days on Market
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 leading-none">
                                        65
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-border-base"></div>
                                <div>
                                    <p className="text-[11px] text-text-muted uppercase font-semibold mb-1">
                                        Views
                                    </p>
                                    <p className="text-2xl font-bold text-text-primary leading-none">
                                        42
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-card border border-border-base flex flex-col gap-6">
                                <div className="w-full flex justify-between items-center">
                                    <h3 className="text-[28px] font-bold text-text-primary mb-1">
                                        $850,000
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="flex w-max h-max items-center gap-1.5 px-3 py-1 text-[10px] rounded-md font-bold bg-[#EAF3EF] text-[#2B805A] uppercase   ">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#2B805A]"></div>{" "}
                                            Available
                                        </span>

                                        <span className="bg-gray-100 h-max w-max text-gray-500 text-[10px] px-3 py-1 rounded-md font-bold uppercase">
                                            For Sale
                                        </span>
                                    </div>
                                </div>
                                {/* 
                                <p className="text-sm text-text-muted font-medium mb-6 flex items-center gap-2">
                                    IDR 13,200,000,000{" "}

                                </p> */}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-border-base">
                                        <BedDouble className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-[10px] text-text-muted font-medium uppercase">
                                                Bedrooms
                                            </p>
                                            <p className="text-sm font-bold text-text-primary">
                                                3 Beds
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-border-base">
                                        <Bath className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-[10px] text-text-muted font-medium uppercase">
                                                Bathrooms
                                            </p>
                                            <p className="text-sm font-bold text-text-primary">
                                                3.5 Baths
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-border-base">
                                        <Maximize className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-[10px] text-text-muted font-medium uppercase">
                                                Land Size
                                            </p>
                                            <p className="text-sm font-bold text-text-primary">
                                                350 m²
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-border-base">
                                        <Home className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-[10px] text-text-muted font-medium uppercase">
                                                Building
                                            </p>
                                            <p className="text-sm font-bold text-text-primary">
                                                200 m²
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-2">
                                    <h4 className="text-sm font-bold text-text-primary">
                                        Description
                                    </h4>
                                    <p className="text-xs text-text-muted leading-relaxed line-clamp-4">
                                        Experience luxury living in the heart of Ubud.
                                        This modern villa features a spacious open-plan
                                        living area, a private infinity pool overlooking
                                        the jungle, and fully equipped modern kitchen.
                                        Built with premium materials, smart home
                                        integration, and sustainable design.
                                    </p>
                                    <button className="text-xs font-semibold text-primary hover:underline">
                                        Baca Selengkapnya
                                    </button>
                                </div>

                            </div>

                            {/* Investor Dossier */}
                            <CardPrimary>
                                <CardPrimaryHeader
                                    title="Investor Dossier"
                                    subtitle="Data rahasia untuk VVIP"
                                    icon={<LockKeyhole size={16} />}
                                    action={
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                    }
                                />
                                <CardPrimaryContent>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <span className="text-xs text-white/70">
                                            Title Status
                                        </span>
                                        <span className="text-sm font-semibold">
                                            Leasehold (25 Years)
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <span className="text-xs text-white/70">
                                            Projected ROI
                                        </span>
                                        <span className="text-sm font-bold text-[#52A77A]">
                                            12.5% / Year
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <span className="text-xs text-white/70">
                                            Zoning
                                        </span>
                                        <span className="text-sm font-semibold">
                                            Yellow (Residential)
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/70">
                                            Partnership
                                        </span>
                                        <span className="text-sm font-semibold">
                                            Open Slot 1
                                        </span>
                                    </div>
                                </CardPrimaryContent>
                            </CardPrimary>
                        </div>
                    </div>
                </div>

                {/* <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-text-primary leading-tight">
                            Modern Villa Ubud
                        </h1>


                        <label
                            className="flex items-center gap-2 cursor-pointer ml-2 border-l border-border-base pl-3"
                            title="Toggle Public Visibility"
                        >
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isPublic}
                                    onChange={(e) =>
                                        setIsPublic(e.target.checked)
                                    }
                                />
                                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                            <span
                                className={cn(
                                    "text-[11px] font-semibold transition-colors",
                                    isPublic
                                        ? "text-primary"
                                        : "text-text-muted"
                                )}
                            >
                                Visible to Public
                            </span>
                        </label>
                    </div>
                    <p className="text-sm text-text-muted flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Ubud, Bali •
                        Ditambahkan 65 hari yang lalu
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/inventory/add"
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary bg-white border border-border-base hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4 stroke-[2.5]" /> Edit
                    </Link>
                    <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 stroke-[2.5]" /> Salin Secret
                        Link
                    </button>
                </div>
            </div> */}
            </DashboardLayout>

            {/* Gallery Modal */}
            {
                galleryOpen && (
                    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-out fade-out data-[state=open]:animate-in data-[state=open]:fade-in" data-state={galleryOpen ? 'open' : 'closed'}>
                        <button
                            onClick={closeGallery}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 lg:p-4 rounded-full backdrop-blur-md z-10 cursor-pointer"
                        >
                            <ChevronLeftIcon className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 lg:p-4 rounded-full backdrop-blur-md z-10 cursor-pointer"
                        >
                            <ChevronRightIcon className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>

                        <div
                            className="max-w-6xl w-full h-full p-4 lg:p-12 flex flex-col items-center justify-center relative"
                            onClick={closeGallery}
                        >
                            <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
                                {propertyImages.map((src, index) => (
                                    <img
                                        key={src}
                                        src={src}
                                        alt={`Gallery Image ${index + 1}`}
                                        className={cn(
                                            "max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-all duration-300 absolute",
                                            index === currentImageIndex ? "opacity-100 scale-100 relative" : "opacity-0 scale-95 pointer-events-none"
                                        )}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ))}
                            </div>
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-medium tracking-widest border border-white/10">
                                <span>{currentImageIndex + 1} / {propertyImages.length}</span>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
