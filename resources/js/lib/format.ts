export const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    }

    if (amount >= 1_000_000_000_000) {
        let val = (amount / 1_000_000_000_000).toFixed(2);
        val = val.replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1");
        return `Rp ${val.replace(".", ",")} T`;
    }
    if (amount >= 1_000_000_000) {
        let val = (amount / 1_000_000_000).toFixed(2);
        val = val.replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1");
        return `Rp ${val.replace(".", ",")} M`;
    }
    if (amount >= 100_000_000) {
        let val = (amount / 1_000_000).toFixed(2);
        val = val.replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1");
        return `Rp ${val.replace(".", ",")} Jt`;
    }
    if (amount >= 1_000_000) {
        let val = (amount / 1_000_000).toFixed(2);
        val = val.replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1");
        return `Rp ${val.replace(".", ",")} Jt`;
    }
    return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
};

export function formatPrice(price: number, currency: string): string {
    if (currency === "IDR") {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: "compact",
            compactDisplay: "short",
        }).format(price);
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        notation: "compact",
        compactDisplay: "short",
    }).format(price);
}

export function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}
