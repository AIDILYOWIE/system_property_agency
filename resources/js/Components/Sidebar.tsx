import React, { memo, useCallback, type FC, type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    LayoutDashboard,
    Building2,
    Users,
    Handshake,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bell,
    X,
    Menu,
    type LucideIcon,
    Clock,
    TrendingUp,
    ShieldCheck,
    BarChart3,
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
    key: string;
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: number | string;
    badgeVariant?: 'danger' | 'warning' | 'success' | 'info';
    routeName?: string;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

// ─── Navigation Config ───────────────────────────────────────────────────────
// Defined outside component to avoid re-creation on render (React best practice)

const NAV_SECTIONS: NavSection[] = [
    {
        title: 'MENU',
        items: [
            {
                key: 'dashboard',
                label: 'Overview',
                href: '/',
                icon: LayoutDashboard,
                routeName: 'dashboard',
            },
            {
                key: 'properties',
                label: 'Inventory',
                href: '/inventory',
                icon: Building2,
                routeName: 'inventory',
            },
        ],
    },
    {
        title: 'CRM',
        items: [
            {
                key: 'crm-buyers',
                label: 'Buyer Pipeline',
                href: '/buyer-pipeline',
                icon: TrendingUp,
                routeName: 'buyer-pipeline',
            },
            // {
            //     key: 'crm-partners',
            //     label: 'Open Slot Partners',
            //     href: '/admin/crm/partners',
            //     icon: Handshake,
            //     routeName: 'crm.partners',
            // },
            {
                key: 'customers',
                label: 'All Customers',
                href: '/customer',
                icon: Users,
                routeName: 'customer',
            },
        ],
    },
    // {
    //     title: 'ANALYTICS',
    //     items: [
    //         {
    //             key: 'analytics',
    //             label: 'Reports',
    //             href: '/admin/analytics',
    //             icon: BarChart3,
    //             routeName: 'analytics',
    //         },
    //     ],
    // },
    {
        title: 'GENERAL',
        items: [
            {
                key: 'settings',
                label: 'Settings',
                href: '/admin/settings',
                icon: Settings,
                routeName: 'settings',
            },
        ],
    },
];

// ─── Badge Component ─────────────────────────────────────────────────────────

const BadgeCount = memo(({ value, variant }: { value: number | string; variant?: NavItem['badgeVariant'] }) => {
    const colorMap: Record<NonNullable<NavItem['badgeVariant']>, string> = {
        danger: 'bg-danger/15 text-danger',
        warning: 'bg-warning/15 text-warning',
        success: 'bg-success/15 text-success',
        info: 'bg-info/15 text-info',
    };
    const colorClass = colorMap[variant ?? 'danger'];

    return (
        <span
            className={`badge-count ${colorClass} min-w-[18px]`}
            aria-label={`${value} notifications`}
        >
            {value}
        </span>
    );
});
BadgeCount.displayName = 'BadgeCount';

// ─── Nav Item Component ───────────────────────────────────────────────────────

interface NavItemProps {
    item: NavItem;
    isCollapsed: boolean;
    isActive: boolean;
    onClick: (key: string) => void;
}

const NavItemButton = memo(({ item, isCollapsed, isActive, onClick }: NavItemProps) => {
    const IconComponent = item.icon;

    const handleClick = useCallback(() => {
        onClick(item.key);
    }, [item.key, onClick]);

    return (
        <Link
            href={item.href}
            onClick={handleClick}
            className={`sidebar-item group relative ${isActive ? 'active' : ''}`}
            aria-label={isCollapsed ? item.label : undefined}
            aria-current={isActive ? 'page' : undefined}
        >
            {/* Active indicator bar */}
            {isActive && (
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                    aria-hidden="true"
                />
            )}

            {/* Icon */}
            <IconComponent
                className={`sidebar-icon flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                    }`}
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
            />

            {/* Label + Badge */}
            {!isCollapsed && (
                <>
                    <span className="flex-1 truncate text-sm leading-none">{item.label}</span>
                    {item.badge !== undefined && (
                        <BadgeCount value={item.badge} variant={item.badgeVariant} />
                    )}
                </>
            )}

            {/* Tooltip when collapsed */}
            {isCollapsed && (
                <div
                    className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md
                               whitespace-nowrap opacity-0 pointer-events-none
                               group-hover:opacity-100 transition-opacity duration-150 z-tooltip"
                    role="tooltip"
                >
                    {item.label}
                    {item.badge !== undefined && (
                        <span className="ml-1 text-red-400 font-semibold">{item.badge}</span>
                    )}
                    <span className="absolute top-1/2 -translate-y-1/2 right-full w-0 h-0
                                     border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
                </div>
            )}
        </Link>
    );
});
NavItemButton.displayName = 'NavItemButton';

// ─── Brand Logo ──────────────────────────────────────────────────────────────

const BrandLogo: FC<{ isCollapsed: boolean }> = memo(({ isCollapsed }) => (
    <div className="flex items-center gap-3 overflow-hidden">
        {/* Icon mark */}
        <div
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
            aria-hidden="true"
        >
            <ShieldCheck size={16} className="text-white" strokeWidth={2.5} />
        </div>

        {/* Brand name — hidden when collapsed */}
        {!isCollapsed && (
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-text-primary leading-none tracking-tight truncate">
                    Chris Property
                </p>
                <p className="text-[0.625rem] font-medium text-primary mt-0.5 tracking-widest uppercase leading-none">
                    Signature
                </p>
            </div>
        )}
    </div>
));
BrandLogo.displayName = 'BrandLogo';

// ─── User Footer ─────────────────────────────────────────────────────────────

interface SidebarFooterProps {
    isCollapsed: boolean;
}

const SidebarFooter: FC<SidebarFooterProps> = memo(({ isCollapsed }) => {
    // Take initials from name

    return (
        <div className="border-t border-border-base px-2 py-3">

            {/* Logout button */}
            <Link
                href={route('logout')}
                method="post"
                as="button"
                className={`sidebar-item group text-danger hover:bg-danger/10 hover:text-danger
                                ${isCollapsed ? 'justify-center px-0' : ''}`}
                aria-label="Log out"
            >
                <LogOut
                    size={16}
                    strokeWidth={2}
                    className="flex-shrink-0 text-danger/60 group-hover:text-danger transition-colors duration-200"
                    aria-hidden="true"
                />
                {!isCollapsed && (
                    <span className="text-sm">Log out</span>
                )}
            </Link>
        </div>
    );
});
SidebarFooter.displayName = 'SidebarFooter';

// ─── Sidebar Overlay (mobile) ─────────────────────────────────────────────────

const SidebarOverlay: FC<{ isOpen: boolean; onClose: () => void }> = memo(({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-sidebar lg:hidden"
            onClick={onClose}
            aria-hidden="true"
        />
    );
});
SidebarOverlay.displayName = 'SidebarOverlay';

// ─── Main Sidebar Component ───────────────────────────────────────────────────

interface SidebarProps {
    /** Override badge count for a specific nav key — used for live KPI numbers */
    badgeOverrides?: Partial<Record<string, number>>;
}

const Sidebar: FC<SidebarProps> = memo(({ badgeOverrides = {} }) => {
    const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile, activeItem, setActiveItem } = useSidebar();
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;

    // Auto-sync active item based on current URL path
    React.useEffect(() => {
        const flatItems = NAV_SECTIONS.flatMap(s => s.items);
        // Find best match. We sort by length descending to match more specific routes first (e.g. /admin/crm/buyers before /admin/crm)
        const matchedItem = [...flatItems].sort((a, b) => b.href.length - a.href.length).find(item => url.startsWith(item.href));

        if (matchedItem) {
            setActiveItem(matchedItem.key);
        }
    }, [url, setActiveItem]);

    const handleItemClick = useCallback((key: string) => {
        setActiveItem(key);
        closeMobile(); // auto-close on mobile after navigation
    }, [setActiveItem, closeMobile]);

    // Merge static badges with live overrides
    const resolvedSections: NavSection[] = NAV_SECTIONS.map(section => ({
        ...section,
        items: section.items.map(item => ({
            ...item,
            badge: badgeOverrides[item.key] ?? item.badge,
        })),
    }));

    const sidebarContent = (
        <nav
            className={`
                flex flex-col h-full bg-surface border-r border-border-base
                transition-all duration-300 overflow-hidden
                ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}
            `}
            aria-label="Main navigation"
        >
            {/* ── Header (Logo + Toggle) ────────────────────────────── */}
            <div className={`
                flex border-b border-border-base min-h-[56px] transition-all duration-300
                ${isCollapsed ? 'flex-col items-center justify-center py-4 gap-3' : 'flex-row items-center justify-between px-3'}
            `}>
                <BrandLogo isCollapsed={isCollapsed} />

                {/* Desktop Toggle Collapse Action */}
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 text-text-muted hover:text-text-primary flex-shrink-0 items-center justify-center"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}
                </button>
            </div>

            {/* ── Nav Items (scrollable) ────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5">
                {resolvedSections.map((section, sIdx) => (
                    <div key={sIdx}>
                        {/* Section Header */}
                        {!isCollapsed && section.title && (
                            <p className="sidebar-section-label pt-6">{section.title}</p>
                        )}
                        {isCollapsed && section.title && sIdx > 0 && (
                            <div className="my-2 mx-3 border-t border-border-base" aria-hidden="true" />
                        )}

                        {/* Items */}
                        {section.items.map(item => (
                            <NavItemButton
                                key={item.key}
                                item={item}
                                isCollapsed={isCollapsed}
                                isActive={activeItem === item.key}
                                onClick={handleItemClick}
                            />
                        ))}
                    </div>
                ))}
            </div>


            {/* ── User Footer ───────────────────────────────────────── */}
            <SidebarFooter
                isCollapsed={isCollapsed}
            />
        </nav>
    );

    return (
        <>
            {/* ── Desktop Sidebar (always visible, toggleable) ──────── */}
            <aside
                className="hidden lg:flex flex-shrink-0 h-screen sticky top-0 z-sidebar"
                aria-label="Sidebar"
            >
                {sidebarContent}
            </aside>

            {/* ── Mobile Overlay ────────────────────────────────────── */}
            <SidebarOverlay isOpen={isMobileOpen} onClose={closeMobile} />

            {/* ── Mobile Sidebar (slide-in) ─────────────────────────── */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-sidebar flex lg:hidden
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                aria-hidden={!isMobileOpen}
                aria-label="Mobile navigation"
            >
                {/* Force expanded on mobile */}
                <nav
                    className="flex flex-col h-full w-[240px] bg-surface border-r border-border-base"
                    aria-label="Mobile navigation menu"
                >
                    <div className="flex items-center justify-between min-h-[56px] px-3 border-b border-border-base">
                        <BrandLogo isCollapsed={false} />
                        <button
                            type="button"
                            onClick={closeMobile}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150"
                            aria-label="Close navigation"
                        >
                            <X size={18} className="text-text-secondary" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                        {resolvedSections.map((section, sIdx) => (
                            <div key={sIdx}>
                                {section.title && (
                                    <p className="sidebar-section-label">{section.title}</p>
                                )}
                                {section.items.map(item => (
                                    <NavItemButton
                                        key={item.key}
                                        item={item}
                                        isCollapsed={false}
                                        isActive={activeItem === item.key}
                                        onClick={handleItemClick}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    <SidebarFooter
                        isCollapsed={false}
                    />
                </nav>
            </aside>
        </>
    );
});
Sidebar.displayName = 'Sidebar';

// ─── Mobile Hamburger Button ─────────────────────────────────────────────────
// Export separately so it can be placed in the topbar

interface MobileMenuButtonProps {
    className?: string;
}

export const MobileMenuButton: FC<MobileMenuButtonProps> = memo(({ className = '' }) => {
    const { toggleMobile, isMobileOpen } = useSidebar();
    return (
        <button
            type="button"
            onClick={toggleMobile}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 lg:hidden ${className}`}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
        >
            {isMobileOpen
                ? <X size={20} className="text-text-secondary" aria-hidden="true" />
                : <Menu size={20} className="text-text-secondary" aria-hidden="true" />
            }
        </button>
    );
});
MobileMenuButton.displayName = 'MobileMenuButton';

// ─── Notification Bell ────────────────────────────────────────────────────────
// Reusable topbar element

interface NotificationBellProps {
    count?: number;
}

export const NotificationBell: FC<NotificationBellProps> = memo(({ count = 0 }) => (
    <button
        type="button"
        className="relative p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
        aria-label={count > 0 ? `${count} notifications` : 'No new notifications'}
    >
        <Bell size={18} className="text-text-secondary" aria-hidden="true" />
        {count > 0 && (
            <span
                className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full ring-2 ring-surface"
                aria-hidden="true"
            />
        )}
    </button>
));
NotificationBell.displayName = 'NotificationBell';

export default Sidebar;
