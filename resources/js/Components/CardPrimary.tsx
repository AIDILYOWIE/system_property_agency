import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function CardPrimary({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-2xl p-6 border bg-primary border-primary/20 relative overflow-hidden shadow-card",
                className
            )}
        >
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage:
                        "repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 20px, rgba(255,255,255,0.05) 21px, rgba(255,255,255,0.05) 40px)",
                }}
            />
            <div className="relative z-10 text-white">
                {children}
            </div>
        </div>
    );
}

export function CardPrimaryHeader({
    title,
    subtitle,
    icon,
    action,
    className,
}: {
    title: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center justify-between mb-5", className)}>
            <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-white">
                    {icon && <span className="text-white/80">{icon}</span>}
                    {title}
                </h2>
                {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function CardPrimaryContent({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={cn("space-y-4", className)}>{children}</div>;
}
