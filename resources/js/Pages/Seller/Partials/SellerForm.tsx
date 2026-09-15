"use client";

import React from "react";
import { Link, useForm } from "@inertiajs/react";
import {
    Info,
    Tag,
    Phone,
    Mail
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
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
    { label: "Website", value: "website" },
    { label: "Instagram", value: "instagram" },
    { label: "TikTok", value: "tiktok" },
    { label: "Walk In", value: "walk-in" },
    { label: "Referral / Rekomendasi", value: "referral" },
    { label: "Marketplace (OLX/Rumah123)", value: "marketplace" },
    { label: "Other", value: "other" },
];

export interface SellerFormState {
    name: string;
    phone: string;
    email: string;
    source: string;
    notes: string;
}

export default function SellerForm({
    formId = "seller-form",
    initialData,
    isEdit = false,
    sellerId
}: {
    formId?: string;
    initialData?: Partial<SellerFormState>;
    isEdit?: boolean;
    sellerId?: string;
}) {
    const { data: form, setData: setForm, post, put, processing, errors } = useForm<SellerFormState>({
        name: initialData?.name ?? "",
        phone: initialData?.phone ?? "",
        email: initialData?.email ?? "",
        source: initialData?.source ?? "",
        notes: initialData?.notes ?? "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitOptions = {
            preserveScroll: true,
            onError: (err: any) => {
                console.error("Validation Error:", err);
            }
        };

        if (isEdit && sellerId) {
            put(route("seller.update", sellerId), submitOptions);
        } else {
            post(route("seller.store"), submitOptions);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* ── Breadcrumb ─────────────────────────────────────────── */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }} />}>
                            All Seller
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{isEdit ? "Edit Property Seller" : "Add Property Seller"}</BreadcrumbPage>
                    </BreadcrumbItem>
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
                                <Field data-invalid={!!errors.name}>
                                    <FieldLabel htmlFor="name" required>
                                        Full Name
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., Budi Santoso"
                                        value={form.name}
                                        onChange={(e) => setForm("name", e.target.value)}
                                        required
                                        className="!bg-canvas"
                                    />
                                    {errors.name && (
                                        <FieldDescription className="text-error-base">
                                            {errors.name}
                                        </FieldDescription>
                                    )}
                                </Field>

                                {/* WhatsApp */}
                                <Field data-invalid={!!errors.phone}>
                                    <FieldLabel htmlFor="phone" required>
                                        WhatsApp
                                    </FieldLabel>
                                    <InputGroup id="phone">
                                        <InputGroupInput
                                            type="text"
                                            value={form.phone}
                                            onChange={(e) => setForm("phone", e.target.value)}
                                            className="!bg-canvas"
                                            placeholder="e.g., 081234567890"
                                        />
                                        <InputGroupAddon>
                                            <Phone size={18} />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {errors.phone ? (
                                        <FieldDescription className="text-error-base">
                                            {errors.phone}
                                        </FieldDescription>
                                    ) : (
                                        <FieldDescription>
                                            Numbers starting with 08 are auto-converted to 628 format.
                                        </FieldDescription>
                                    )}
                                </Field>

                                {/* Email */}
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email Address
                                        <span className="ml-1.5 text-[10px] font-normal text-text-muted normal-case tracking-normal">
                                            Optional
                                        </span>
                                    </FieldLabel>
                                    <InputGroup id="email">
                                        <InputGroupInput
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm("email", e.target.value)}
                                            className="!bg-canvas"
                                            placeholder="e.g., budi@gmail.com"
                                        />
                                        <InputGroupAddon>
                                            <Mail size={18} />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {errors.email && (
                                        <FieldDescription className="text-error-base">
                                            {errors.email}
                                        </FieldDescription>
                                    )}
                                </Field>
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── RIGHT: Source & Notes ────────────────────────── */}
                    <div className="flex flex-col gap-6">
                        <SectionCard icon={<Tag size={16} />} title="Source & Note">
                            <div className="flex flex-col gap-4">
                                {/* Source */}
                                <Field data-invalid={!!errors.source}>
                                    <FieldLabel required htmlFor="source">
                                        Source / Asal
                                    </FieldLabel>
                                    <Select
                                        id="source"
                                        value={form.source}
                                        onValueChange={(val) => setForm("source", val as string)}
                                    >
                                        <SelectTrigger className={cn("!bg-canvas", errors.source && "!border-error-base")}>
                                            <SelectValue placeholder="Pilih Sumber..." />
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
                                    <FieldLabel htmlFor="notes">
                                        Initial Notes
                                        <span className="ml-1.5 text-[10px] font-normal text-text-muted normal-case tracking-normal">
                                            Optional
                                        </span>
                                    </FieldLabel>
                                    <Textarea
                                        id="notes"
                                        rows={6}
                                        className="!bg-canvas"
                                        value={form.notes}
                                        onChange={(e) => setForm("notes", e.target.value)}
                                        placeholder="e.g. Pemilik minta jual cepat..."
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
