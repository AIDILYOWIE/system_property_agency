import * as React from "react"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"

export interface PropertyItem {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    category: string;
    listingType: string;
    status: string;
    thumbnail: string;
}

interface SelectSearchProps {
    items: PropertyItem[];
    value?: string;
    onChange?: (val: string | null) => void;
    placeholder?: string;
}

export default function SelectSearch({ items, value, onChange, placeholder = "Select a property..." }: SelectSearchProps) {
    const [search, setSearch] = React.useState("");

    const filteredItems = React.useMemo(() => {
        if (!search) return items;
        return items.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.location.toLowerCase().includes(search.toLowerCase())
        );
    }, [items, search]);

    // Format IDR/USD beautifully
    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(price);
    }

    const selectedItem = React.useMemo(
        () => items.find((i) => i.id === value),
        [items, value]
    );

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="!bg-canvas w-full h-auto py-3">
                {selectedItem ? (
                    <span className="text-text-primary text-sm truncate font-medium">
                        {selectedItem.title}
                    </span>
                ) : (
                    <SelectValue placeholder={placeholder} />
                )}
            </SelectTrigger>
            <SelectContent className="w-[--anchor-width] p-0">
                <div className="p-2 border-b border-border-base sticky top-0 bg-popover z-10 flex items-center gap-2">
                    <Search size={16} className="text-text-muted shrink-0 ml-1" />
                    <input
                        className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 text-text-primary h-8 placeholder:text-text-muted"
                        placeholder="Search by title or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()} // Prevent BaseUI from capturing typing
                    />
                </div>
                <SelectGroup className="max-h-64 overflow-y-auto p-1">
                    {filteredItems.length === 0 ? (
                        <div className="py-6 px-4 text-sm text-center text-text-muted">No properties found.</div>
                    ) : (
                        filteredItems.map(item => (
                            <SelectItem key={item.id} value={item.id} className="cursor-pointer mb-1 last:mb-0">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-border-base">
                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-sm font-semibold text-text-primary truncate block w-full">{item.title}</span>
                                        <span className="text-xs text-text-muted truncate block w-full">
                                            {formatPrice(item.price, item.currency)} • {item.listingType}
                                        </span>
                                    </div>
                                </div>
                            </SelectItem>
                        ))
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
