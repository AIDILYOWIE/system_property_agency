// ─── Pipeline Types ─────────────────────────────────────────────────────────────
// Single source of truth for all US 2.2 pipeline types.

export type PipelineStatus = string;

/** Backward-compat alias — Buyer pipeline statuses */
export type BuyerPipelineStatus =
    | "new_lead"
    | "contacted"
    | "viewing"
    | "negotiation"
    | "won"
    | "lost";

export interface PipelineItem {
    id: string;
    customerId: string;
    name: string;
    phone: string;
    email?: string;
    /** The primary property this lead is interested in */
    propertyName: string;
    propertyLocation: string;
    fullAddress: string;
    propertyPrice: number;
    propertyCurrency: "IDR" | "USD";
    status: PipelineStatus;
    /** "buyer" or "renter" — determines pipeline copy */
    customerType: "buyer" | "renter";
    source: string;
    createdAt: string;
    lastContacted?: string;
}

export interface StageConfig {
    status: PipelineStatus;
    label: string;
    color: string; // Tailwind bg class for badge
    textColor: string; // Tailwind text class for badge
    borderColor: string; // Tailwind border class for badge
    dotColor: string; // Tailwind color for the dot indicator
}
