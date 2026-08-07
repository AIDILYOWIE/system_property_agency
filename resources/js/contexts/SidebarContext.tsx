import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SidebarContextValue {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapsed: () => void;
    toggleMobile: () => void;
    closeMobile: () => void;
    activeItem: string;
    setActiveItem: (key: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SidebarContext = createContext<SidebarContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface SidebarProviderProps {
    children: ReactNode;
    defaultActive?: string;
}

export function SidebarProvider({ children, defaultActive = 'dashboard' }: SidebarProviderProps) {
    // Persist collapsed state in localStorage for consistent UX
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(defaultActive);

    const toggleCollapsed = useCallback(() => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar-collapsed', String(next));
            return next;
        });
    }, []);

    const toggleMobile = useCallback(() => {
        setIsMobileOpen(prev => !prev);
    }, []);

    const closeMobile = useCallback(() => {
        setIsMobileOpen(false);
    }, []);

    // Close mobile sidebar on route change (window resize fallback)
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <SidebarContext.Provider
            value={{ isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile, activeItem, setActiveItem }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSidebar(): SidebarContextValue {
    const ctx = useContext(SidebarContext);
    if (!ctx) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return ctx;
}
