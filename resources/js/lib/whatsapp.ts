// ─── lib/whatsapp.ts ─────────────────────────────────────────────────────────
// Single source of truth untuk semua integrasi WhatsApp (US 3.1 – PRD Model 1).
//
// Prinsip desain:
//   • Pure functions — tidak ada side-effects, mudah ditest dan dipakai ulang.
//   • Tidak ada import React — file ini adalah utility plain TypeScript.
//   • Semua string template terpusat di sini sehingga perubahan copy hanya
//     perlu dilakukan di satu tempat.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tipe ─────────────────────────────────────────────────────────────────────

/** Data minimum yang dibutuhkan untuk membangun URL WA. */
export interface WhatsAppContactParams {
    /** Nomor telepon pelanggan. Boleh format 08xxx atau 628xxx — akan dinormalisasi. */
    phone: string;
    /** Nama pelanggan untuk interpolasi pesan. */
    clientName: string;
    /**
     * Nama properti yang diminati pelanggan.
     * Opsional — jika tidak diberikan, template tanpa properti digunakan.
     */
    propertyName?: string;
    /**
     * Tipe pelanggan — digunakan untuk memilih template pesan yang tepat.
     * "property_owner" menghasilkan template kemitraan, sisanya template follow-up biasa.
     */
    customerType?: string;
    /**
     * Nama agen atau agensi yang tertera dalam pesan.
     * @default "Chris Property Signature"
     */
    agentName?: string;
}

// ── Konstanta ────────────────────────────────────────────────────────────────

/** Nama agen default sesuai branding project. */
const DEFAULT_AGENT_NAME = "Chris Property Signature";

// ── Fungsi Inti ───────────────────────────────────────────────────────────────

/**
 * Normalisasi nomor telepon ke format internasional 628xxx.
 *
 * Aturan (sesuai US 2.3 Rule 3 & US 3.1 Rule 1 PRD):
 *   • "08xxx"  → "628xxx"
 *   • "8xxx"   → "628xxx"  (tanpa awalan)
 *   • "628xxx" → "628xxx"  (sudah benar, tidak diubah)
 *   • "+628xx" → "628xxx"  (strip tanda +)
 *
 * Fungsi ini juga membuang semua karakter non-digit sebelum proses.
 */
export function normalizePhoneNumber(raw: string): string {
    // Buang semua karakter non-digit ( spasi, tanda hubung, + dll )
    const digits = raw.replace(/\D/g, "");

    if (digits.startsWith("628")) return digits;
    if (digits.startsWith("08")) return "62" + digits.slice(1);
    if (digits.startsWith("8")) return "62" + digits;

    // Kembalikan apa adanya jika pola tidak dikenali — supaya URL tetap terbentuk
    // dan tidak melempar error; validasi sesungguhnya ada di layer form/backend.
    return digits;
}

/**
 * Generate template pesan WA yang kontekstual (sesuai US 3.1 Rule 2 PRD).
 *
 * Prioritas template:
 *   1. `customerType === "property_owner"` → Pesan khusus kemitraan properti.
 *   2. `propertyName` disertakan → Pesan dengan sebutan nama properti.
 *   3. Fallback → Pesan pembuka umum tanpa menyebut properti.
 */
export function buildWhatsAppMessage(params: WhatsAppContactParams): string {
    const agent = params.agentName ?? DEFAULT_AGENT_NAME;

    if (params.customerType === "property_owner") {
        return (
            `Halo ${params.clientName}, saya ${agent}. ` +
            `Saya telah menerima pengajuan kemitraan untuk properti Anda. ` +
            `Boleh saya minta beberapa foto tambahan?`
        );
    }

    if (params.propertyName) {
        return (
            `Halo ${params.clientName}, saya ${agent}. ` +
            `Terima kasih atas ketertarikan Anda pada ${params.propertyName}. ` +
            `Apakah ada waktu untuk berdiskusi lebih lanjut?`
        );
    }

    return (
        `Halo ${params.clientName}, saya ${agent}. ` +
        `Apakah ada waktu untuk berdiskusi lebih lanjut mengenai kebutuhan properti Anda?`
    );
}

/**
 * Bangun URL WhatsApp wa.me yang siap pakai (sesuai US 3.1 Rule 1 & Rule 3 PRD).
 *
 * URL ini kompatibel dengan:
 *   • Desktop/Laptop  → membuka WhatsApp Web
 *   • Mobile          → membuka aplikasi WhatsApp langsung
 *
 * @returns URL string, contoh: "https://wa.me/628123456789?text=Halo..."
 */
export function buildWhatsAppUrl(params: WhatsAppContactParams): string {
    const normalizedPhone = normalizePhoneNumber(params.phone);
    const message = buildWhatsAppMessage(params);
    const encodedText = encodeURIComponent(message);

    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

/**
 * Shorthand satu langkah: dapatkan URL WA sekaligus.
 *
 * Ini adalah fungsi yang paling sering dipakai di seluruh aplikasi —
 * cukup panggil dengan data pelanggan, langsung dapat URL untuk `href`.
 *
 * @example
 * ```tsx
 * // Buyer / Renter — dengan nama properti
 * <a href={getWhatsAppUrl({ phone: lead.phone, clientName: lead.name, propertyName: lead.propertyName })}>
 *   Hubungi via WA
 * </a>
 *
 * // Property Owner — template kemitraan otomatis
 * <a href={getWhatsAppUrl({ phone: owner.phone, clientName: owner.name, customerType: "property_owner" })}>
 *   Hubungi via WA
 * </a>
 * ```
 */
export function getWhatsAppUrl(params: WhatsAppContactParams): string {
    return buildWhatsAppUrl(params);
}
