import { cn } from "@/lib/utils"

export default function SectionCard({
    icon,
    title,
    children,
    className,
    dark = false,
}: {
    icon: React.ReactNode
    title: string
    subtitle?: string
    children: React.ReactNode
    className?: string
    dark?: boolean
}) {
    return (
        <div
            className={cn(
                "rounded-2xl p-6 border",
                dark
                    ? "bg-primary border-primary/20 relative overflow-hidden"
                    : "bg-white border-border-base shadow-card",
                className
            )}
        >
            {dark && (
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage:
                            "repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 20px, rgba(255,255,255,0.05) 21px, rgba(255,255,255,0.05) 40px)",
                    }}
                />
            )}
            <div className={cn("relative z-10", dark ? "text-white" : "")}>
                <h2
                    className={cn(
                        "text-base font-bold mb-5 flex items-center gap-2",
                        dark ? "text-white" : "text-text-primary"
                    )}
                >
                    <span className={dark ? "text-white/80" : "text-primary"}>{icon}</span>
                    {title}
                </h2>
                {children}
            </div>
        </div>
    )
}