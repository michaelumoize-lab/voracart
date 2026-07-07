// components/Admin/AdminSidebar.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useSyncExternalStore,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/auth-helper";
import { useAdminStore } from "@/stores/adminStore";
import SidebarCountBadge from "@/components/ui/SidebarCountBadge";
import {
  Users,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  Menu,
  X,
  Package,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

const POLL_INTERVAL = 30_000;

type CountKey = "pendingApplications";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  countKey?: CountKey;
}

interface SidebarSharedProps {
  menuItems: MenuItem[];
  getCount: (key?: CountKey) => number;
  isPathActive: (path: string) => boolean;
}

// ---------------------------------------------------------------------------
// useMounted — avoids hydration mismatch
// ---------------------------------------------------------------------------

function subscribe(cb: () => void): () => void {
  return () => {};
}

function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

// ---------------------------------------------------------------------------
// NavItem
// ---------------------------------------------------------------------------

interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  count: number;
  onClick?: () => void;
  mobile?: boolean;
}

const NavItem = ({
  item,
  isActive,
  count,
  onClick,
  mobile = false,
}: NavItemProps) => {
  const Icon = item.icon;
  return (
    <Link href={item.path} onClick={onClick}>
      <div
        className={`flex items-center gap-3 mx-2 rounded-lg transition-colors cursor-pointer
          ${mobile ? "py-3 px-4" : "py-2.5 px-4"}
          ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1 text-sm font-medium">{item.name}</span>
        <SidebarCountBadge count={count} />
      </div>
    </Link>
  );
};

// ---------------------------------------------------------------------------
// SidebarHeader
// ---------------------------------------------------------------------------

interface SidebarHeaderProps {
  onClose?: () => void;
}

const SidebarHeader = ({ onClose }: SidebarHeaderProps) => (
  <div className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex items-center gap-2">
      <Link href="/admin" className="font-bold text-xl text-primary">
        VoraCart
      </Link>
      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
        Admin
      </span>
    </div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-accent transition"
        aria-label="Close menu"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </button>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// SidebarNav
// ---------------------------------------------------------------------------

interface SidebarNavProps extends SidebarSharedProps {
  onItemClick?: () => void;
  mobile?: boolean;
}

const SidebarNav = ({
  menuItems,
  getCount,
  isPathActive,
  onItemClick,
  mobile,
}: SidebarNavProps) => (
  <nav className="flex-1 py-4 overflow-y-auto">
    {menuItems.map((item) => (
      <NavItem
        key={item.path}
        item={item}
        isActive={isPathActive(item.path)}
        count={getCount(item.countKey)}
        onClick={onItemClick}
        mobile={mobile}
      />
    ))}
  </nav>
);

// ---------------------------------------------------------------------------
// DesktopSidebar
// ---------------------------------------------------------------------------

const DesktopSidebar = (props: SidebarSharedProps) => (
  <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-30">
    <SidebarHeader />
    <SidebarNav {...props} />
  </aside>
);

// ---------------------------------------------------------------------------
// MobileSidebar
// ---------------------------------------------------------------------------

interface MobileSidebarProps extends SidebarSharedProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose, ...shared }: MobileSidebarProps) => (
  <>
    {isOpen && (
      <div
        role="presentation"
        className="md:hidden fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
    )}

    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className={`md:hidden fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarHeader onClose={onClose} />
      <SidebarNav {...shared} onItemClick={onClose} mobile />
    </div>
  </>
);

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

const SidebarSkeleton = () => (
  <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-30">
    <div className="flex items-center gap-2.5 p-4 border-b border-border">
      <div className="h-6 w-24 rounded bg-muted animate-pulse" />
      <div className="h-5 w-11 rounded-full bg-muted animate-pulse" />
    </div>
    <nav className="flex-1 py-4 space-y-0.5">
      <SkeletonItem width="w-18" delay="delay-[0ms]" />
      <SkeletonItem width="w-24" delay="delay-[40ms]" badge />
      <SkeletonItem width="w-11" delay="delay-[80ms]" />
      <SkeletonItem width="w-20" delay="delay-[120ms]" />
      <SkeletonItem width="w-14" delay="delay-[160ms]" />
      <SkeletonItem width="w-16" delay="delay-[200ms]" />
    </nav>
  </aside>
);

const SkeletonItem = ({
  width,
  delay,
  badge = false,
}: {
  width: string;
  delay: string;
  badge?: boolean;
}) => (
  <div className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-lg">
    <div
      className={`h-5 w-5 rounded bg-muted animate-pulse ${delay} shrink-0`}
    />
    <div
      className={`h-3 ${width} rounded bg-muted animate-pulse ${delay} flex-1`}
    />
    {badge && (
      <div
        className={`h-[18px] w-6 rounded-full bg-muted animate-pulse ${delay}`}
      />
    )}
  </div>
);

// ---------------------------------------------------------------------------
// AdminSidebar - main export
// ---------------------------------------------------------------------------

const AdminSidebar = () => {
  const pathname = usePathname();
  const mounted = useMounted();
  const { isAdmin, isLoading: roleLoading } = useRole();

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const { pendingApplications, fetchPendingApplications } = useAdminStore();

  // Polling for pending applications
  useEffect(() => {
    if (!isAdmin) return;
    void fetchPendingApplications();
    const id = setInterval(
      () => void fetchPendingApplications(),
      POLL_INTERVAL,
    );
    return () => clearInterval(id);
  }, [isAdmin, fetchPendingApplications]);

  // Close mobile menu on route change
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      const id = setTimeout(() => setIsMobileOpen(false), 0);
      return () => clearTimeout(id);
    }
  }, [pathname]);

  const isPathActive = useCallback(
    (itemPath: string): boolean => {
      if (itemPath === "/admin") return pathname === itemPath;
      return pathname.startsWith(itemPath + "/") || pathname === itemPath;
    },
    [pathname],
  );

  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    {
      name: "Applications",
      path: "/admin/applications",
      icon: Users,
      countKey: "pendingApplications",
    },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "All Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Reports", path: "/admin/reports", icon: FileText },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const getCount = useCallback(
    (key?: CountKey): number => {
      return key === "pendingApplications" ? pendingApplications : 0;
    },
    [pendingApplications],
  );

  if (roleLoading || !mounted) return <SidebarSkeleton />;
  if (!isAdmin) return null;

  const sharedProps: SidebarSharedProps = {
    menuItems,
    getCount,
    isPathActive,
  };

  return (
    <>
      <DesktopSidebar {...sharedProps} />

      {/* Mobile hamburger trigger */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-background border border-border shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <MobileSidebar
        {...sharedProps}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
    </>
  );
};

export default AdminSidebar;
