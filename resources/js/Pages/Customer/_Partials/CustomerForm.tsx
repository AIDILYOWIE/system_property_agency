"use client";

import { useState } from "react";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import {
    Info,
    LayoutGrid,
    Tag,
    Phone,
    Mail,
    Building2,
} from "lucide-react";
import { Input } from "@/Components/ui/input";
import { FieldLabel, FieldDescription, Field } from "@/Components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/Components/ui/input-group";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import SectionCard from "@/Components/SectionCard";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import SelectSearch, { type PropertyItem } from "@/Components/SelectSearch";
import PropertyPickerModal from "./PropertyPickerModal";
import PropertyInterestCard, { type PropertyInterestItem } from "@/Components/PropertyInterestCard";
import { type InventoryProperty } from "./PropertyInterestRepeater";

// ─── Types ────────────────────────────────────────────────────────────────────

type Source =
    | "website"
    | "instagram"
    | "tiktok"
    | "google"
    | "referral"
    | "whatsapp"
    | "manual"
    | "";

export interface FormState {
    fullName: string;
    phone: string;
    email: string;
    source: Source;
    note: string;
    property_ids: string[];
}

// ─── Source options ────────────────────────────────────────────────────────────

const SOURCE_OPTIONS = [
    { label: "Website", value: "website" },
    { label: "Instagram", value: "instagram" },
    { label: "TikTok", value: "tiktok" },
    { label: "Walk In", value: "walk-in" },
    { label: "Other", value: "other" },
];

// ─── CustomerForm ─────────────────────────────────────────────────────────────

import { useForm } from "@inertiajs/react";
import { toast } from "@/Components/ui/toast";

export default function CustomerForm({
    initialData,
    isEdit,
    formId,
    customerId,
    properties = [],
    customerProperties = [],
}: {
    initialData?: Partial<FormState>;
    isEdit?: boolean;
    formId?: string;
    customerId?: string;
    properties?: PropertyItem[];
    customerProperties?: any[];
}) {
    const { data: form, setData: setForm, post, put, processing, errors } = useForm<FormState>({
        fullName: initialData?.fullName ?? "",
        phone: initialData?.phone ?? "",
        email: initialData?.email ?? "",
        source: initialData?.source ?? "",
        note: initialData?.note ?? "",
        property_ids: initialData?.property_ids ?? [],
    });

    const [pickerOpen, setPickerOpen] = useState(false);

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(key, value as any);
    }

    const handlePropertySelect = (inv: InventoryProperty) => {
        setForm("property_ids", [...form.property_ids, inv.id]);
    };

    const handlePropertyRemove = (idToRemove: string) => {
        setForm("property_ids", form.property_ids.filter((id) => id !== idToRemove));
    };

    const selectedPropertiesDetails = form.property_ids
        .map(id => {
            const prop = (properties as any[]).find(p => p.id === id);
            if (!prop) return null;
            const existingProp = customerProperties?.find((cp: any) => cp.id === id);
            return {
                ...prop,
                pipelineStatus: existingProp?.pipelineStatus || "new_lead"
            };
        })
        .filter(Boolean) as any[];

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const submitOptions = {
            preserveScroll: true,
            onError: (err: any) => {
                toast.add({
                    title: "Validation Error",
                    description: "Please check the highlighted fields.",
                    type: "error"
                });
            }
        };

        if (isEdit && customerId) {
            put(route('customer.update', customerId), submitOptions);
        } else {
            post(route('customer.store'), submitOptions);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* ── Breadcrumb ─────────────────────────────────────────── */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/customer" />}>
                            Customers
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {isEdit ? (
                        <>
                            <BreadcrumbItem>
                                <BreadcrumbLink render={<Link href="/customer/detail" />}>
                                    Detail Customer
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Edit Customer</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    ) : (
                        <BreadcrumbItem>
                            <BreadcrumbPage>Add New Customer</BreadcrumbPage>
                        </BreadcrumbItem>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            <form id={formId} onSubmit={handleSubmit}>
                {/* ── Two-column grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT: Main Details ──────────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Basic Information */}
                        <SectionCard icon={<Info size={16} />} title="Basic Information">
                            <div className="flex flex-col gap-5">
                                {/* Full Name */}
                                <Field data-invalid={!!errors.fullName} >
                                    <FieldLabel htmlFor="full_name" required>
                                        Full Name
                                    </FieldLabel>
                                    <Input
                                        id="full_name"
                                        type="text"
                                        placeholder="e.g., John Doe"
                                        value={form.fullName}
                                        onChange={(e) => set("fullName", e.target.value)}
                                        required
                                        className="!bg-canvas"
                                    />
                                    {errors.fullName && (
                                        <FieldDescription className="text-error-base">
                                            {errors.fullName}
                                        </FieldDescription>
                                    )}
                                </Field>

                                {/* WhatsApp */}
                                <Field data-invalid={!!errors.phone} >
                                    <FieldLabel htmlFor="phone" required>
                                        WhatsApp
                                    </FieldLabel>
                                    <InputGroup id="phone">
                                        <InputGroupInput
                                            type="text"
                                            value={form.phone}
                                            onChange={(e) => set("phone", e.target.value)}
                                            className="!bg-canvas"
                                            placeholder="e.g., 081234567890"
                                        />
                                        <InputGroupAddon>
                                            <Phone size={18} />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {errors.phone ? (<FieldDescription className="text-error-base">
                                        {errors.phone}
                                    </FieldDescription>) : (<FieldDescription>
                                        Numbers starting with 08 are auto-converted to 628 format.
                                    </FieldDescription>)}
                                </Field>

                                {/* Email */}
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email
                                        <span className="ml-1.5 text-[10px] font-normal text-text-muted normal-case tracking-normal">
                                            Optional
                                        </span>
                                    </FieldLabel>
                                    <InputGroup id="email">
                                        <InputGroupInput
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => set("email", e.target.value)}
                                            className="!bg-canvas"
                                            placeholder="Enter email"
                                        />
                                        <InputGroupAddon>
                                            <Mail size={18} />
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>
                            </div>
                        </SectionCard>

                        {/* ── Property Interests (PropertyPickerModal) ─────── */}
                        <SectionCard
                            icon={<Building2 size={16} />}
                            title="Property Interest"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-xs text-text-muted leading-relaxed max-w-[85%]">
                                    Pilih properti yang diminati oleh client. Kamu dapat menambahkan lebih dari satu properti.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(true)}
                                    className="text-xs font-semibold text-primary bg-[#EAF3EF] px-3 py-1.5 rounded-md hover:bg-[#EAF3EF]/80 transition-colors flex-shrink-0"
                                >
                                    + Tambah
                                </button>
                            </div>

                            <Field data-invalid={!!errors.property_ids} >
                                <div className="divide-y divide-border-base border border-border-base rounded-xl overflow-hidden">
                                    {selectedPropertiesDetails.length === 0 ? (
                                        <div className="py-8 flex flex-col items-center text-center bg-canvas">
                                            <Building2 size={24} className="text-border-base mb-2" />
                                            <p className="text-sm font-medium text-text-muted">Belum ada properti</p>
                                        </div>
                                    ) : (
                                        selectedPropertiesDetails.map((property) => {
                                            const mappedProps: PropertyInterestItem = {
                                                id: property.id,
                                                title: property.title,
                                                location: property.location,
                                                price: property.price,
                                                currency: property.currency,
                                                thumbnail: property.thumbnail,
                                                listingType: property.listingType,
                                                status: property.status === "draft" ? "available" : property.status,
                                                pipelineStatus: property.pipelineStatus,
                                            };
                                            const canRemove = property.pipelineStatus === "new_lead";
                                            return (
                                                <div key={property.id} className="relative group">
                                                    <PropertyInterestCard property={mappedProps} />
                                                    {canRemove && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePropertyRemove(property.id)}
                                                            className="absolute top-4 right-4 w-7 h-7 bg-white border border-red-200 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 cursor-pointer z-10"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {errors.property_ids && (
                                    <FieldDescription className="text-error-base mt-2">
                                        {errors.property_ids}
                                    </FieldDescription>
                                )}
                            </Field>

                            <PropertyPickerModal
                                open={pickerOpen}
                                onClose={() => setPickerOpen(false)}
                                onSelect={handlePropertySelect}
                                selectedId={null}
                                disabledIds={form.property_ids}
                            />
                        </SectionCard>
                    </div>

                    {/* ── RIGHT: Source & Notes ────────────────────────── */}
                    <div className="flex flex-col gap-6">
                        <SectionCard icon={<Tag size={16} />} title="Source & Note">
                            <div className="flex flex-col gap-4">
                                {/* Source */}
                                <Field data-invalid={!!errors.source} >
                                    <FieldLabel required htmlFor="source">
                                        Source
                                    </FieldLabel>
                                    <Select
                                        id="source"
                                        value={form.source}
                                        onValueChange={(val) =>
                                            val && set("source", val as Source)
                                        }
                                    >
                                        <SelectTrigger className="!bg-canvas">
                                            <SelectValue placeholder="Select Source" />
                                        </SelectTrigger>
                                        <SelectContent className="font-sans">
                                            <SelectGroup>
                                                {SOURCE_OPTIONS.map((item) => (
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
                                    {errors.source && (
                                        <FieldDescription className="text-error-base">
                                            {errors.source}
                                        </FieldDescription>
                                    )}
                                </Field>

                                {/* Notes */}
                                <Field>
                                    <FieldLabel htmlFor="notes" optional>
                                        Notes
                                    </FieldLabel>
                                    <Textarea
                                        id="notes"
                                        rows={6}
                                        value={form.note}
                                        onChange={(e) => set("note", e.target.value)}
                                        placeholder="Additional context, preferences, budget range..."
                                    />
                                </Field>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </form>
        </div>
    );
}
