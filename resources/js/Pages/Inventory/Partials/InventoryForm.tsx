"use client";

import { useState, useRef } from "react";
import { router, Link, useForm } from "@inertiajs/react";
import { toast } from "@/Components/ui/toast";
import { cn } from "@/lib/utils";
import {
    Info,
    LayoutGrid,
    Tag,
    ImageIcon,
    LockKeyhole,
    MapPin,
    BedDouble,
    Bath,
    ChevronLeft,
    Check,
    UploadCloud,
    PlusCircle,
} from "lucide-react";
import { Input } from "@/Components/ui/input";
import { FieldLabel, FieldDescription, Field, FieldError } from "@/Components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/Components/ui/input-group";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectItem,
} from "@/Components/ui/select";
import { ButtonGroup } from "@/Components/ui/button-group";
import SectionCard from "@/Components/SectionCard";
import { CardPrimary, CardPrimaryHeader, CardPrimaryContent } from "@/Components/CardPrimary";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";

// ─── Types ────────────────────────────────────────────────────────────────────

type ListingType = "sale" | "rent";
type Category =
    | "villas"
    | "premium_houses"
    | "strategic_land"
    | "commercial"
    | "";
type TitleStatus = "freehold" | "leasehold" | "";
type Currency = "IDR" | "USD";
type Zoning = "yellow" | "commercial" | "green" | "pink" | "";

interface FormState {
    title: string;
    location: string;
    description: string;
    price: string;
    currency: Currency;
    landSize: string;
    buildingSize: string;
    bedrooms: string;
    bathrooms: string;
    listingType: ListingType;
    category: Category;
    titleStatus: TitleStatus;
    leaseholdYears: string;
    projectedRoi: string;
    zoning: Zoning;
    images?: string[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────


const CURRENCY = [
    { label: "US Dollar", value: "USD" },
    { label: "Indonesian Rupiah", value: "IDR" },
];


const CATEGORYS = [
    { label: "Villas", value: "villas" },
    { label: "Premium Houses", value: "premium_houses" },
    { label: "Strategic Land", value: "strategic_land" },
    { label: "Commercial", value: "commercial" },
]

const TITLESTATUS = [
    { label: "Freehold", value: "freehold" },
    { label: "Leasehold", value: "leasehold" },
]


const ZOONING = [
    { label: "Yellow (Residential)", value: "yellow" },
    { label: "Commercial", value: "commercial" },
    { label: "Green (Agriculture)", value: "green" },
    { label: "Pink (Tourism)", value: "pink" },
]

export default function InventoryForm({ initialData, isEdit, propertyId }: { initialData?: Partial<FormState>, isEdit?: boolean, propertyId?: string | number }) {
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        initialData?.images?.[0] || null
    );
    const existingGallery = initialData?.images?.slice(1) || [];
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(existingGallery);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        title: initialData?.title ?? "",
        location_area: initialData?.location ?? "",
        description: initialData?.description ?? "",
        price: initialData?.price ?? "",
        currency: initialData?.currency ?? "IDR",
        land_size_sqm: initialData?.landSize ?? "",
        building_size_sqm: initialData?.buildingSize ?? "",
        bedrooms: initialData?.bedrooms ?? "",
        bathrooms: initialData?.bathrooms ?? "",
        listing_type: initialData?.listingType ?? "sale",
        category: initialData?.category ?? "",
        tenure_type: initialData?.titleStatus ?? "",
        leasehold_years: initialData?.leaseholdYears ?? "",
        projected_roi: initialData?.projectedRoi ?? "",
        zoning: initialData?.zoning ?? "",
        main_thumbnail: null as File | null,
        gallery: [] as File[],
        deleted_images: [] as string[],
        _method: isEdit ? 'patch' : 'post'
    });

    const isLand = data.category === "strategic_land";
    const isLeasehold = data.tenure_type === "leasehold";

    function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData("main_thumbnail", file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }

    function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) {
            setData("gallery", [...data.gallery, ...files]);
            const previews = files.map((f) => URL.createObjectURL(f));
            setGalleryPreviews((prev) => [...prev, ...previews]);
        }
    }

    function handlePublish(e: React.FormEvent) {
        e.preventDefault();

        // sync deleted_images before post
        data.deleted_images = deletedImages;

        const targetRoute = isEdit && propertyId
            ? route('inventory.update', propertyId)
            : route('inventory.store');

        post(targetRoute, {
            forceFormData: true,
            onError: (err) => {
                toast.add({
                    title: "Validation Error",
                    description: "Please check the highlighted fields.",
                    type: "error"
                });
                console.error(err);
            }
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/inventory" />}>
                            Inventory
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {isEdit ? (
                        <>
                            <BreadcrumbItem>
                                <BreadcrumbLink render={<Link href="/inventory/detail" />}>
                                    Detail Property
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Edit Property</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    ) : (
                        <BreadcrumbItem>
                            <BreadcrumbPage>Add New Property</BreadcrumbPage>
                        </BreadcrumbItem>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            <form id="inventory-form" onSubmit={handlePublish}>
                {/* ── Two-column grid ──────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── LEFT: Main Details ─────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Basic Information */}
                        <SectionCard
                            icon={<Info size={16} />}
                            title="Basic Information"
                        >
                            <div className="flex flex-col gap-5">
                                {/* Property Title */}
                                <div className="">
                                    <Field data-invalid={!!errors.title} >
                                        <FieldLabel required>
                                            Property Title
                                        </FieldLabel>
                                        <Input
                                            type="text"
                                            placeholder="e.g., Beachfront Modern Villa Seminyak"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData(
                                                    "title",
                                                    e.target.value as string,
                                                )
                                            }
                                            required
                                            aria-invalid={!!errors.title}
                                        />
                                        {errors.title && (
                                            <FieldError>{errors.title}</FieldError>
                                        )}
                                    </Field>
                                </div>

                                {/* Location */}
                                <Field>
                                    <FieldLabel required>Location Area</FieldLabel>
                                    <InputGroup className="!focus:ring-0">
                                        <InputGroupInput
                                            value={data.location_area}
                                            onChange={(e) =>
                                                setData(
                                                    "location_area",
                                                    e.target.value as string,
                                                )
                                            }
                                            className="!bg-canvas"
                                            placeholder="Enter your location via url google map"
                                        />
                                        <InputGroupAddon className="">
                                            <MapPin size={18} />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldDescription className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1">
                                        <Info size={11} />
                                        For public listings, do not use exact
                                        addresses. Only specify the general area.
                                    </FieldDescription>
                                </Field>

                                {/* Description */}
                                <Field>
                                    <FieldLabel optional>Description</FieldLabel>
                                    <Textarea
                                        rows={6}
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value as string,
                                            )
                                        }
                                        placeholder="Describe the property, selling points, and key features..."
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        {/* Specifications & Pricing */}
                        <SectionCard
                            icon={<LayoutGrid size={16} />}
                            title="Specifications & Pricing"
                        >
                            <div className="grid grid-cols-2 gap-5 mb-5">
                                {/* Price */}
                                <div className="col-span-2 sm:col-span-1">
                                    <Field>
                                        <FieldLabel required>Price</FieldLabel>
                                        <ButtonGroup>
                                            <Select
                                                items={CURRENCY}
                                                value={data.currency}
                                                onValueChange={(value) =>
                                                    setData(
                                                        "currency",
                                                        value as Currency,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className={
                                                        "!w-max text-base !rounded-tr-none !rounded-br-none !p-0 !px-2"
                                                    }
                                                >
                                                    {data.currency}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {CURRENCY.map((item) => (
                                                            <SelectItem
                                                                key={item.value}
                                                                value={item.value}
                                                            >
                                                                {item.value}{" "}
                                                                <span className="">
                                                                    {item.label}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={data.price}
                                                onChange={(e) => setData("price", e.target.value)}
                                                className="!bg-canvas !rounded-lg !rounded-tl-none !rounded-bl-none "
                                                placeholder="Enter your price"
                                            />
                                        </ButtonGroup>
                                    </Field>
                                </div>


                                {/* Land Size */}
                                <Field>
                                    <FieldLabel required>
                                        Land Size (sqm)
                                    </FieldLabel>
                                    <InputGroup className="!focus:ring-0">
                                        <InputGroupInput
                                            value={data.land_size_sqm}
                                            onChange={(e) =>
                                                setData(
                                                    "land_size_sqm",
                                                    e.target.value as string,
                                                )
                                            }
                                            type="number"
                                            className="!bg-canvas"
                                            placeholder="0"
                                        />
                                        <InputGroupAddon align={"inline-end"}>
                                            <InputGroupText className="text-sm text-text-primary">
                                                m²
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>

                                {/* Building Size */}
                                <Field>
                                    <FieldLabel required>
                                        Building Size (sqm)
                                    </FieldLabel>
                                    <InputGroup className="!focus:ring-0">
                                        <InputGroupInput
                                            value={data.building_size_sqm}
                                            onChange={(e) =>
                                                setData(
                                                    "building_size_sqm",
                                                    e.target.value as string,
                                                )
                                            }
                                            type="number"
                                            className="!bg-canvas"
                                            placeholder="0"
                                        />
                                        <InputGroupAddon align={"inline-end"}>
                                            <InputGroupText className="text-sm text-text-primary">
                                                m²
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>
                            </div>

                            {/* Bed / Bath — hidden for Land */}
                            {!isLand && (
                                <div className="grid grid-cols-2 gap-5 pt-5 border-t border-border-base">
                                    <Field>
                                        <FieldLabel required>Bedrooms</FieldLabel>
                                        <InputGroup className="!focus:ring-0">
                                            <InputGroupAddon>
                                                <BedDouble size={15} />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                value={data.bedrooms}
                                                onChange={(e) =>
                                                    setData(
                                                        "bedrooms",
                                                        e.target.value as string,
                                                    )
                                                }
                                                type="number"
                                                className="!bg-canvas"
                                                placeholder="0"
                                            />
                                        </InputGroup>
                                    </Field>
                                    <Field>
                                        <FieldLabel required>Bathrooms</FieldLabel>
                                        <InputGroup className="!focus:ring-0">
                                            <InputGroupAddon>
                                                <Bath size={15} />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                value={data.bathrooms}
                                                onChange={(e) =>
                                                    setData(
                                                        "bathrooms",
                                                        e.target.value as string,
                                                    )
                                                }
                                                type="number"
                                                className="!bg-canvas"
                                                placeholder="0"
                                            />
                                        </InputGroup>
                                    </Field>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* ── RIGHT: Settings & Media ────────────── */}
                    <div className="flex flex-col gap-6">
                        {/* Classification */}
                        <SectionCard
                            icon={<Tag size={16} />}
                            title="Classification"
                        >
                            <div className="flex flex-col gap-4">
                                {/* Listing Type — toggle pill */}
                                <Field>
                                    <FieldLabel required>Listing Type</FieldLabel>
                                    <div className="flex bg-canvas border border-border-base p-1 rounded-lg">
                                        {(["sale", "rent"] as ListingType[]).map(
                                            (type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() =>
                                                        setData("listing_type", type)
                                                    }
                                                    className={cn(
                                                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                                        data.listing_type === type
                                                            ? "bg-white shadow-sm text-primary"
                                                            : "text-text-muted hover:text-text-primary",
                                                    )}
                                                >
                                                    {type === "sale"
                                                        ? "For Sale"
                                                        : "For Rent"}
                                                </button>
                                            ),
                                        )}
                                        {/* <Tabs
                                                value={form.listingType}
                                                onValueChange={(val) => set("listingType", val as ListingType)}
                                                className="w-full"
                                            >
                                                <TabsList className="flex w-full bg-canvas border border-border-base p-1 rounded-xl h-auto !bg-canvas">
                                                    <TabsTrigger
                                                        value="sale"
                                                        className="flex-1 py-2 text-sm font-medium rounded-lg transition-all h-auto data-active:bg-white data-active:shadow-sm data-active:text-primary text-text-muted hover:text-text-primary"
                                                    >
                                                        For Sale
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="rent"
                                                        className="flex-1 py-2 text-sm font-medium rounded-lg transition-all h-auto data-active:bg-white data-active:shadow-sm data-active:text-primary text-text-muted hover:text-text-primary"
                                                    >
                                                        For Rent
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs> */}
                                    </div>
                                </Field>

                                {/* Category */}
                                <Field>
                                    <FieldLabel required>Category</FieldLabel>
                                    <Select
                                        items={CATEGORYS}
                                        value={data.category}
                                        onValueChange={(value) =>
                                            setData("category", value as Category)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {CATEGORYS.map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                        </SectionCard>

                        {/* Media Upload */}
                        <SectionCard icon={<ImageIcon size={16} />} title="Media">
                            <div className="flex flex-col gap-4">
                                {/* Main Thumbnail */}
                                <Field>
                                    <FieldLabel required>Main Thumbnail</FieldLabel>
                                    <Input
                                        ref={thumbnailInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleThumbnailChange}
                                    />

                                    {thumbnailPreview ? (
                                        <div className="relative rounded-xl overflow-hidden border border-border-base group">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="w-full h-36 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setThumbnailPreview(null);
                                                    if (thumbnailInputRef.current)
                                                        thumbnailInputRef.current.value =
                                                            "";
                                                }}
                                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-border-base flex items-center justify-center text-text-muted hover:text-red-500 transition-colors text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                thumbnailInputRef.current?.click()
                                            }
                                            className="w-full border-2 border-dashed border-border-base bg-canvas hover:bg-white rounded-lg p-6 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-border-base flex items-center justify-center text-text-primary mb-3 transition-transform">
                                                <UploadCloud size={18} />
                                            </div>
                                            <p className="text-sm font-semibold text-text-primary">
                                                Click to upload or drag & drop
                                            </p>
                                            <p className="text-xs text-text-muted mt-1">
                                                PNG, JPG or WebP (Max. 5MB)
                                            </p>
                                        </button>
                                    )}
                                </Field>

                                {/* Gallery */}
                                <Field>
                                    <FieldLabel required>Gallery Images</FieldLabel>
                                    <Input
                                        ref={galleryInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={handleGalleryChange}
                                    />
                                    {galleryPreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            {galleryPreviews.map((src, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative rounded-lg overflow-hidden border border-border-base aspect-square"
                                                >
                                                    <img
                                                        src={src}
                                                        alt={`Gallery ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // if src starts with blob:, it's a new file. if not, it's an existing image.
                                                            if (!src.startsWith('blob:')) {
                                                                // add the relative path to deleted images. 
                                                                // src is likely /storage/properties/...
                                                                // the backend just needs the path.
                                                                const path = src.replace('/storage/', '');
                                                                setDeletedImages(prev => [...prev, path]);
                                                            }
                                                            setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 border border-border-base flex items-center justify-center text-text-muted hover:text-red-500 transition-colors text-[10px]"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            galleryInputRef.current?.click()
                                        }
                                        className="w-full border-2 border-dashed border-border-base bg-canvas hover:bg-white rounded-lg p-4 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <PlusCircle
                                            size={16}
                                            className="text-text-muted group-hover:text-primary transition-colors"
                                        />
                                        <span className="text-sm text-text-muted font-medium group-hover:text-text-primary transition-colors">
                                            Add more photos
                                        </span>
                                    </button>
                                </Field>
                            </div>
                        </SectionCard>

                        {/* Investor Dossier */}
                        <CardPrimary>
                            <CardPrimaryHeader
                                icon={<LockKeyhole size={16} />}
                                title="Investor Dossier Fields"
                                subtitle="These fields are used for generating private VVIP prospectuses."
                            />
                            <CardPrimaryContent className="flex flex-col gap-4 !bg-transparent !space-y-0">
                                {/* Title Status */}
                                <Field>
                                    <FieldLabel>Title Status</FieldLabel>
                                    <Select
                                        items={TITLESTATUS}
                                        value={data.tenure_type}
                                        onValueChange={(value) =>
                                            setData("tenure_type", value as TitleStatus)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                "!bg-white/10 !border-white/20 !text-white !placeholder-white/30"
                                            }
                                        >
                                            <SelectValue placeholder="Select Title Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {TITLESTATUS.map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {/* Leasehold Years (conditional) */}
                                {isLeasehold && (
                                    <Field>
                                        <FieldLabel>
                                            Leasehold Years Remaining
                                        </FieldLabel>
                                        <InputGroup className="!focus:ring-0 !bg-white/10 !border-white/20">
                                            <InputGroupInput
                                                type="number"
                                                value={data.leasehold_years}
                                                className="!text-white !placeholder-white/30"
                                                placeholder="e.g., 25"
                                                onChange={(e) =>
                                                    setData(
                                                        "leasehold_years",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputGroupAddon
                                                align={"inline-end"}
                                                className="!bg-transparent"
                                            >
                                                <InputGroupText className="text-sm !text-white">
                                                    Yrs
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Projected ROI */}
                                    <Field>
                                        <FieldLabel>Projected ROI</FieldLabel>
                                        <InputGroup className="!focus:ring-0 !bg-white/10 !border-white/20">
                                            <InputGroupInput
                                                type="number"
                                                value={data.projected_roi}
                                                onChange={(e) =>
                                                    setData(
                                                        "projected_roi",
                                                        e.target.value,
                                                    )
                                                }
                                                className="!text-white !placeholder-white/30"
                                                placeholder="0.0"
                                                step={"0.1"}
                                            />
                                            <InputGroupAddon
                                                align={"inline-end"}
                                                className="!bg-transparent"
                                            >
                                                <InputGroupText className="text-sm !text-white">
                                                    %
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>

                                    {/* Zoning */}
                                    <Field>
                                        <FieldLabel>Zoning</FieldLabel>
                                        <Select
                                            items={ZOONING}
                                            value={data.zoning}
                                            onValueChange={(value) =>
                                                setData("zoning", value as Zoning)
                                            }
                                        >
                                            <SelectTrigger
                                                className={
                                                    "!bg-white/10 !border-white/20 !text-white !placeholder-white/30"
                                                }
                                            >
                                                <SelectValue placeholder="Select Zoning" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {ZOONING.map((item) => (
                                                        <SelectItem
                                                            key={item.value}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                            </CardPrimaryContent>
                        </CardPrimary>
                    </div>
                </div>
            </form>
        </div>
    );
}
