import { type FC, type ReactNode, memo } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Sidebar, { MobileMenuButton, NotificationBell } from '@/Components/Sidebar';
import { Search } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
    children: ReactNode;
    /** Page title shown in the topbar */
    pageTitle?: string;
    /** Optional subtitle / breadcrumb description */
    pageDescription?: string;
    /** Optional CTA actions rendered right side of topbar */
    actions?: ReactNode;
    /** Live badge overrides keyed by nav item key */
    badgeOverrides?: Record<string, number>;
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

interface TopbarProps {
    pageTitle?: string;
    pageDescription?: string;
    actions?: ReactNode;
}

const Topbar: FC<TopbarProps> = memo(({ pageTitle, pageDescription, actions }) => {
    const { auth } = usePage<PageProps>().props;

    return (
        <header
            className="sticky top-0 z-header h-14 flex items-center justify-between
                       bg-surface/90 backdrop-blur-sm border-b border-border-base
                       px-5 gap-4 flex-shrink-0"
        >
            {/* Left: Hamburger (mobile) + Title */}
                <MobileMenuButton />

            {/* Center: Search bar */}
            <div className="flex-1 max-w-xs hidden md:flex">
                <div className="relative w-full">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="w-full pl-8 pr-4 py-1.5 text-sm bg-canvas border border-border-base
                                   rounded-md placeholder:text-text-muted
                                   focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
                                   transition-colors duration-150"
                        aria-label="Search"
                    />
                </div>
            </div>

            {/* Right: Actions + Bell + User */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}

                <NotificationBell count={0} />

                {/* User avatar (desktop topbar) */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border-base ml-1">
                    <div
                        className="w-7 h-7 rounded-full bg-primary-light text-primary
                                   flex items-center justify-center text-xs font-bold select-none"
                        aria-label={`User: ${auth?.user?.name}`}
                    >
                        {auth?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="text-xs font-medium text-text-primary hidden lg:block">
                        {auth?.user?.name ?? 'Owner'}
                    </span>
                </div>
            </div>
        </header>
    );
});
Topbar.displayName = 'Topbar';

// ─── DashboardLayout ──────────────────────────────────────────────────────────

const DashboardLayoutInner: FC<DashboardLayoutProps> = ({
    children,
    pageTitle,
    pageDescription,
    actions,
    badgeOverrides = {},
}) => {
    return (
        <div className="flex h-screen overflow-hidden bg-canvas font-sans">
            {/* ── Sidebar ──────────────────────────────────────────── */}
            <Sidebar badgeOverrides={badgeOverrides} />

            {/* ── Main Column ──────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Topbar */}
                <Topbar
                    pageTitle={pageTitle}
                    pageDescription={pageDescription}
                    actions={actions}
                />

                {/* Page content */}
                <main
                    className="flex-1 overflow-y-auto p-5 lg:p-6"
                    id="main-content"
                    tabIndex={-1}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

// ─── Exported wrapper with Provider ──────────────────────────────────────────

const DashboardLayout: FC<DashboardLayoutProps> = (props) => (
    <SidebarProvider>
        <DashboardLayoutInner {...props} />
    </SidebarProvider>
);

export default DashboardLayout;
