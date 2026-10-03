import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { BuyerPipelineStatus } from "./pipelineTypes";

interface StatusReasonModalProps {
    show: boolean;
    leadId: string | null;
    status: BuyerPipelineStatus | null;
    onClose: () => void;
    onSubmit: (leadId: string, status: BuyerPipelineStatus, reason: string) => void;
}

export default function StatusReasonModal({ show, leadId, status, onClose, onSubmit }: StatusReasonModalProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    // Reset when modal opens
    useEffect(() => {
        if (show) {
            setReason("");
            setError("");
        }
    }, [show]);

    const isWon = status === "won";
    const title = isWon ? "Tandai sebagai WON (Deal)" : "Tandai sebagai LOST (Gagal)";
    const description = isWon
        ? "Selamat! Mohon sebutkan alasan mengapa klien ini berhasil closing (won). Informasi ini sangat berguna untuk strategi sales berikutnya."
        : "Mohon sebutkan alasan mengapa klien ini gagal dikonversi (lost), informasi ini sangat berguna untuk analitik sales berikutnya.";
    const placeholder = isWon
        ? "Contoh: Klien menyukai lokasi, harga cocok, KPR disetujui..."
        : "Contoh: Klien merasa harga terlalu mahal, atau klien pindah ke agen lain...";

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
