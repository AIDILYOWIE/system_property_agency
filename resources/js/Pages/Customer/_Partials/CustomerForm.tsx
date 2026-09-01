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

interface FormState {
    fullName: string;
    phone: string;
    email: string;
    source: Source;
    note: string;
    property_id: string; // 1 client only has 1 property
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
    properties = [],
}: {
    initialData?: Partial<FormState>;
    isEdit?: boolean;
    formId?: string;
    properties?: PropertyItem[];
}) {
    const { data: form, setData: setForm, post, processing, errors } = useForm<FormState>({
        fullName: initialData?.fullName ?? "",
        phone: initialData?.phone ?? "",
        email: initialData?.email ?? "",
        source: initialData?.source ?? "",
        note: initialData?.note ?? "",
        property_id: initialData?.property_id ?? "",
    });

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(key, value as any);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        post(route('customer.store'), {
            preserveScroll: true,
            onError: (err) => {
                toast.add({
                    title: "Validation Error",
                    description: "Please check the highlighted fields.",
                    type: "error"
                });
            }
        });
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

                        {/* ── Property Interests (SelectSearch) ─────── */}
                        <SectionCard
                            icon={<Building2 size={16} />}
                            title="Property Interest"
                        >
                            {/* Context hint */}
                            <p className="text-xs text-text-muted mb-5 leading-relaxed">
                                A client typically focuses on one active property at a time. Select the property they are inquiring about.
                            </p>

                            <Field data-invalid={!!errors.property_id} >
                                <FieldLabel required>Interested Property</FieldLabel>
                                <SelectSearch
                                    items={properties}
                                    value={form.property_id}
                                    onChange={(val) => set("property_id", val || "")}
                                />
                                {errors.property_id && (
                                    <FieldDescription className="text-error-base">
                                        {errors.property_id}
                                    </FieldDescription>
                                )}
                            </Field>
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
