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
    return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
};
