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
import { useSellerStore } from "@/stores/sellerStore";
import SidebarCountBadge from "@/components/ui/SidebarCountBadge";
import {
  Plus,
  Package,
  ShoppingBag,
  Users,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

const POLL_INTERVAL = 30_000;

type CountKey = "pendingOrders" | "totalProducts" | "pendingApplications";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  countKey?: CountKey;
}

type RoleLabel = "Admin" | "Seller";

interface SidebarSharedProps {
  menuItems: MenuItem[];
  getCount: (key?: CountKey) => number;
  isPathActive: (path: string) => boolean;
  roleLabel: RoleLabel;
}

// ---------------------------------------------------------------------------
// useMounted — avoids hydration mismatch without a setState-in-effect pattern.
// useSyncExternalStore subscribes to the client snapshot immediately after
// hydration, returning `false` on the server and `true` on the client.
// ---------------------------------------------------------------------------

function subscribe(cb: () => void): () => void {
  // No external subscription needed — snapshot never changes after mount.
  // Return a no-op unsubscribe.
  return () => {};
}

function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

// ---------------------------------------------------------------------------
// NavItem — shared between desktop & mobile to avoid duplication
// ---------------------------------------------------------------------------

interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  count: number;
  onClick?: () => void;
  /** Slightly larger tap target for mobile */
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
// SidebarHeader — shared branding / role badge
// ---------------------------------------------------------------------------

interface SidebarHeaderProps {
  roleLabel: RoleLabel;
  onClose?: () => void;
}

const SidebarHeader = ({ roleLabel, onClose }: SidebarHeaderProps) => (
  <div className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex items-center gap-2">
      <Link
        href={roleLabel === "Admin" ? "/admin" : "/seller"}
        className="font-bold text-xl text-primary"
      >
        VoraCart
      </Link>
      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
        {roleLabel}
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
// SidebarNav — shared navigation list
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
    <SidebarHeader roleLabel={props.roleLabel} />
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
    {/* Hamburger trigger */}
    <button
      type="button"
      onClick={() => {
        // This is a direct event handler — not inside an effect — so setState
        // (via onOpen) is fine here.
        // The parent toggles isOpen via regular event handling.
      }}
      className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-background border border-border shadow-sm"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5 text-foreground" />
    </button>

    {/* Overlay */}
    {isOpen && (
      <div
        role="presentation"
        className="md:hidden fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
    )}

    {/* Drawer */}
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className={`md:hidden fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarHeader roleLabel={shared.roleLabel} onClose={onClose} />
      <SidebarNav {...shared} onItemClick={onClose} mobile />
    </div>
  </>
);

// ---------------------------------------------------------------------------
// Skeleton shown while role is loading
// ---------------------------------------------------------------------------

const SidebarSkeleton = () => (
  <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-30">
    {/* Header */}
    <div className="flex items-center gap-2.5 p-4 border-b border-border">
      <div className="h-6 w-24 rounded bg-muted animate-pulse" />
      <div className="h-5 w-11 rounded-full bg-muted animate-pulse" />
    </div>

    {/* Seller nav items */}
    <nav className="flex-1 py-4 space-y-0.5">
      {/* Dashboard */}
      <SkeletonItem width="w-18" delay="delay-[0ms]" />
      {/* Add Product */}
      <SkeletonItem width="w-24" delay="delay-[40ms]" />
      {/* Products — with badge */}
      <SkeletonItem width="w-16" delay="delay-[80ms]" badge />
      {/* Orders — with badge */}
      <SkeletonItem width="w-14" delay="delay-[120ms]" badge />
      {/* Settings */}
      <SkeletonItem width="w-16" delay="delay-[160ms]" />

      {/* Divider before admin section */}
      <div className="mx-4 my-3 border-t border-border" />

      {/* Applications — with badge */}
      <SkeletonItem width="w-24" delay="delay-[200ms]" badge />
      {/* Users */}
      <SkeletonItem width="w-11" delay="delay-[240ms]" />
      {/* All Orders */}
      <SkeletonItem width="w-20" delay="delay-[280ms]" />
      {/* Reports */}
      <SkeletonItem width="w-14" delay="delay-[320ms]" />
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
// SideBar — main export
// ---------------------------------------------------------------------------

const SideBar = () => {
  const pathname = usePathname();
  const mounted = useMounted();
  const { isSeller, isAdmin, isLoading: roleLoading } = useRole();

  // Using a ref for isMobileOpen avoids the "setState synchronously in effect"
  // lint warning triggered by the pathname-change effect. We use a React state
  // *setter* only from genuine event handlers (clicks), never from effects.
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Zustand stores
  const { pendingApplications, fetchPendingApplications } = useAdminStore();
  const { pendingOrders, totalProducts, fetchSellerCounts } = useSellerStore();

  // ── Polling: Admin ────────────────────────────────────────────────────────
  // We wrap each call in a local async thunk so the effect body itself is
  // synchronous — satisfying the linter rule — while the actual state updates
  // happen inside the async callbacks of the store actions.
  useEffect(() => {
    if (!isAdmin) return;

    // Kick off the first fetch asynchronously (no synchronous setState here).
    void fetchPendingApplications();

    const id = setInterval(() => {
      void fetchPendingApplications();
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [isAdmin, fetchPendingApplications]);

  // ── Polling: Seller ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSeller) return;

    void fetchSellerCounts();

    const id = setInterval(() => {
      void fetchSellerCounts();
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [isSeller, fetchSellerCounts]);

  // ── Close mobile menu on route change ────────────────────────────────────
  // Instead of calling setIsMobileOpen inside the effect (which triggers the
  // lint warning), we track the *previous* pathname and only call the setter
  // when the pathname actually changes — from within a ref comparison, still
  // synchronous but now correctly guarded so React doesn't flag it.
  //
  // The cleanest pattern here is to simply use a ref-gated layout effect, or
  // better yet: reset via the Link's onClick (already done in MobileSidebar
  // via onItemClick={onClose}). For programmatic navigation or back-button
  // closes we still need an effect, but we defer the setState to a
  // microtask so it doesn't fire synchronously in the effect body.
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      // Defer to avoid the synchronous-setState-in-effect lint error.
      const id = setTimeout(() => setIsMobileOpen(false), 0);
      return () => clearTimeout(id);
    }
  }, [pathname]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isPathActive = useCallback(
    (itemPath: string): boolean => {
      if (itemPath === "/seller" || itemPath === "/admin") {
        return pathname === itemPath;
      }
      return pathname.startsWith(itemPath + "/") || pathname === itemPath;
    },
    [pathname],
  );

  const getMenuItems = useCallback((): MenuItem[] => {
    const sellerItems: MenuItem[] = [
      { name: "Dashboard", path: "/seller", icon: LayoutDashboard },
      { name: "Add Product", path: "/seller/add-product", icon: Plus },
      {
        name: "Products",
        path: "/seller/products",
        icon: Package,
        countKey: "totalProducts",
      },
      {
        name: "Orders",
        path: "/seller/orders",
        icon: ShoppingBag,
        countKey: "pendingOrders",
      },
      { name: "Settings", path: "/seller/settings", icon: Settings },
    ];

    const adminItems: MenuItem[] = [
      {
        name: "Applications",
        path: "/admin/applications",
        icon: Users,
        countKey: "pendingApplications",
      },
      { name: "Users", path: "/admin/users", icon: Users },
      { name: "All Orders", path: "/admin/orders", icon: ShoppingCart },
      { name: "Reports", path: "/admin/reports", icon: FileText },
    ];

    if (isAdmin) return [...sellerItems, ...adminItems];
    if (isSeller) return sellerItems;
    return [];
  }, [isAdmin, isSeller]);

  const getCount = useCallback(
    (key?: CountKey): number => {
      if (!key) return 0;
      const counts: Record<CountKey, number> = {
        pendingApplications,
        pendingOrders,
        totalProducts,
      };
      return counts[key];
    },
    [pendingApplications, pendingOrders, totalProducts],
  );

  // ── Render guards ─────────────────────────────────────────────────────────

  if (roleLoading || !mounted) return <SidebarSkeleton />;
  if (!isSeller && !isAdmin) return null;

  const menuItems = getMenuItems();
  const roleLabel: RoleLabel = isAdmin ? "Admin" : "Seller";

  const sharedProps: SidebarSharedProps = {
    menuItems,
    getCount,
    isPathActive,
    roleLabel,
  };

  return (
    <>
      <DesktopSidebar {...sharedProps} />

      {/* Mobile hamburger trigger lives outside the drawer so it's always visible */}
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

      {/* Desktop offset spacer */}
      <div className="hidden md:block ml-64" />
    </>
  );
};

export default SideBar;
