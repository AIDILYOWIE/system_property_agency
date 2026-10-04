import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import { Textarea } from "@/Components/ui/textarea";
import { type PipelineStatus } from "./pipelineTypes";

interface StatusReasonModalProps {
    show: boolean;
    leadId: string | null;
    status: PipelineStatus | null;
    onClose: () => void;
    onSubmit: (leadId: string, status: PipelineStatus, reason: string) => void;
    /** 'buyer' shows won/lost copy; 'property' shows rejected copy. Default: 'buyer' */
    pipelineType?: "buyer" | "property";
}

export default function StatusReasonModal({ show, leadId, status, onClose, onSubmit, pipelineType = "buyer" }: StatusReasonModalProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    // Reset when modal opens
    useEffect(() => {
        if (show) {
            setReason("");
            setError("");
        }
    }, [show]);

    // ── Copy resolver: per-status, per-pipeline ────────────────────────────
    const isPropertyPipeline = pipelineType === "property";
    const isWon = status === "won";
    const isListed = status === "listed";

    type ModalCopy = { title: string; description: string; placeholder: string };

    const copy: ModalCopy = (() => {
        if (isPropertyPipeline && isListed) {
            return {
                title: "Tandai Properti sebagai Listed",
                description:
                    "Berikan alasan mengapa properti ini siap untuk dipasarkan. " +
                    "Informasi ini digunakan team sales untuk strategi pemasaran.",
                placeholder:
                    "Contoh: Harga sesuai pasar, dokumen lengkap, akses jalan bagus, foto sudah siap...",
            };
        }
        if (isPropertyPipeline) {
            // rejected
            return {
                title: "Tandai Properti sebagai Rejected",
                description:
                    "Mohon tuliskan alasan penolakan properti ini. " +
                    "Informasi ini membantu screening dan analisis supply team.",
                placeholder:
                    "Contoh: Harga terlalu tinggi, lokasi tidak strategis, kondisi buruk, pemilik batal...",
            };
        }
        // Buyer pipeline
        if (isWon) {
            return {
                title: "Tandai sebagai WON (Deal)",
                description:
                    "Berikan alasan mengapa klien ini berhasil closing (won). " +
                    "Informasi ini sangat berguna untuk strategi sales berikutnya.",
                placeholder: "Contoh: Klien menyukai lokasi, harga cocok, KPR disetujui...",
            };
        }
        return {
            title: "Tandai sebagai LOST (Gagal)",
            description:
                "Mohon sebutkan alasan mengapa klien ini gagal dikonversi (lost), " +
                "informasi ini sangat berguna untuk analitik sales berikutnya.",
            placeholder: "Contoh: Klien merasa harga terlalu mahal, atau klien pindah ke agen lain...",
        };
    })();
    const { title, description, placeholder } = copy;

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError("Alasan wajib diisi.");
            return;
        }

        if (leadId && status) {
            onSubmit(leadId, status, reason);
        }

        // Reset state handled by onClose/useEffect
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-text-primary">
                    {title}
                </h2>

                <p className="text-sm text-text-muted">
                    {description}
                </p>

                <div className="flex flex-col gap-2">
                    <Textarea
                        placeholder={placeholder}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError("");
                        }}
                        className="min-h-[100px] w-full"
                    />
                    {error && (
                        <p className="text-xs text-red-500 font-semibold">{error}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={handleClose}>
                        Batal
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                        Simpan & Update
                    </button>
                </div>
            </div>
        </Modal>
    );
}
