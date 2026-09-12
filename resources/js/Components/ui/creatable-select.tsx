import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, PlusIcon, Search, X } from "lucide-react"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"

export interface CreatableSelectProps {
    value: string
    onChange: (val: string) => void
    options: { label: string; value: string; icon?: React.ReactNode }[]
    placeholder?: string
    onCreateOption?: (val: string) => void
    className?: string
}

export function CreatableSelect({
    value,
    onChange,
    options,
    placeholder = "Select an option...",
    onCreateOption,
    className
}: CreatableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [dropdownStyles, setDropdownStyles] = React.useState<React.CSSProperties>({})

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                open &&
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open])

    const updatePosition = React.useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setDropdownStyles({
                position: 'absolute',
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            })
        }
    }, [])

    React.useEffect(() => {
        if (open) {
            updatePosition()
            window.addEventListener("scroll", updatePosition, true)
            window.addEventListener("resize", updatePosition)
            return () => {
                window.removeEventListener("scroll", updatePosition, true)
                window.removeEventListener("resize", updatePosition)
            }
        }
    }, [open, updatePosition])

    const filteredOptions = React.useMemo(() => {
        if (!search) return options
        const lowerSearch = search.toLowerCase()
        return options.filter(opt => opt.label.toLowerCase().includes(lowerSearch) || opt.value.toLowerCase().includes(lowerSearch))
    }, [search, options])

    const selectedOption = React.useMemo(() => {
        return options.find(opt => opt.value === value)
    }, [value, options])

    const handleSelect = (val: string) => {
        onChange(val)
        setOpen(false)
        setSearch("")
    }

    const handleCreate = () => {
        if (search.trim() && onCreateOption) {
            onCreateOption(search.trim())
            handleSelect(search.trim())
            setSearch("")
            setOpen(false)
        }
    }

    const toggleOpen = () => {
        if (!open) {
            setSearch("")
            updatePosition()
            setOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
        } else {
            setOpen(false)
        }
    }

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <button
                type="button"
                onClick={toggleOpen}
                className="flex w-full px-4 py-3 items-center !bg-canvas text-text-primary justify-between gap-1.5 rounded-lg border border-border-base bg-transparent text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
                <span className="flex flex-1 line-clamp-1 text-left items-center gap-2 truncate">
                    {selectedOption?.icon && (
                        <span className="flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 text-muted-foreground">
                            {selectedOption.icon}
                        </span>
                    )}
                    {selectedOption?.label || value ? (
                        selectedOption?.label || value
                    ) : (
                        <span className="text-muted-foreground font-normal">{placeholder}</span>
                    )}
                </span>
                <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
            </button>

            {open && typeof document !== "undefined" && createPortal(
                <div ref={dropdownRef} style={dropdownStyles} className="z-50 min-w-[200px] overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 origin-top mt-1">
                    <div className="flex items-center relative overflow-hidden">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 shrink-0" />
                        <Input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 !border-0 !border-b !border-border-base focus:!ring-0 pl-9 pr-8 !rounded-b-none"
                            placeholder="Typing to search..."
                        />
                        {search && (
                            <button
                                aria-label="Clear Search"
                                onClick={() => setSearch("")}
                                className="absolute right-2 p-1 hover:bg-muted rounded-full"
                            >
                                <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.slice(0, 100).map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className="relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    {opt.icon && (
                                        <span className="flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 text-muted-foreground">
                                            {opt.icon}
                                        </span>
                                    )}
                                    <span className="flex-1 shrink-0 truncate">{opt.label}</span>
                                    {value === opt.value && (
                                        <CheckIcon className="absolute right-2 flex size-4 text-primary shrink-0" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-2 py-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                <span className="text-xs">No exact match found.</span>
                                {search.trim() && onCreateOption && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleCreate}
                                        className="w-full justify-center mt-1"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        Create "{search}"
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
