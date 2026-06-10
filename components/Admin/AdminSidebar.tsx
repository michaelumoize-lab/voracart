// components/Admin/AdminSidebar.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import SidebarCountBadge from "@/components/Admin/SidebarCountBadge";
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

const POLL_INTERVAL = 30_000;

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  countKey?: "pendingOrders" | "totalProducts" | "pendingApplications";
}

interface SellerCounts {
  pendingOrders: number;
  totalProducts: number;
}

interface AdminCounts {
  pendingApplications: number;
}

// Desktop Sidebar Component
const DesktopSidebar = ({
  menuItems,
  getCount,
  isPathActive,
  roleLabel,
}: {
  menuItems: MenuItem[];
  getCount: (key?: string) => number;
  isPathActive: (path: string) => boolean;
  roleLabel: string;
}) => (
  <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-30">
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Link href={roleLabel === "Admin" ? "/admin" : "/seller"} className="font-bold text-xl text-primary">
          VoraCart
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {roleLabel}
        </span>
      </div>
    </div>

    <nav className="flex-1 py-4 overflow-y-auto">
      {menuItems.map((item) => {
        const isActive = isPathActive(item.path);
        const count = getCount(item.countKey);
        const Icon = item.icon;

        return (
          <Link href={item.path} key={item.name}>
            <div
              className={`flex items-center py-2.5 px-4 gap-3 transition-colors cursor-pointer mx-2 rounded-lg ${
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
      })}
    </nav>
  </aside>
);

// Mobile Sidebar Component
const MobileSidebar = ({
  isOpen,
  setIsOpen,
  menuItems,
  getCount,
  isPathActive,
  roleLabel,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  menuItems: MenuItem[];
  getCount: (key?: string) => number;
  isPathActive: (path: string) => boolean;
  roleLabel: string;
}) => (
  <>
    <button
      onClick={() => setIsOpen(true)}
      className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-background border border-border shadow-sm"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5 text-foreground" />
    </button>

    {isOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />
    )}

    <div
      className={`md:hidden fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Link href={roleLabel === "Admin" ? "/admin" : "/seller"} className="font-bold text-xl text-primary">
            VoraCart
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {roleLabel}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-accent transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = isPathActive(item.path);
          const count = getCount(item.countKey);
          const Icon = item.icon;

          return (
            <Link href={item.path} key={item.name} onClick={() => setIsOpen(false)}>
              <div
                className={`flex items-center py-3 px-4 gap-3 transition-colors cursor-pointer mx-2 rounded-lg ${
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
        })}
      </nav>
    </div>
  </>
);

// Main SideBar Component
const SideBar = () => {
  const pathname = usePathname();
  const { isSeller, isAdmin, isLoading } = useRole();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [sellerCounts, setSellerCounts] = useState<SellerCounts>({
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [adminCounts, setAdminCounts] = useState<AdminCounts>({
    pendingApplications: 0,
  });

  useEffect(() => setMounted(true), []);

  const fetchSellerCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/counts");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setSellerCounts({
          pendingOrders: data.pendingOrders,
          totalProducts: data.totalProducts,
        });
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchAdminCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/counts");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setAdminCounts({ pendingApplications: data.pendingApplications });
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (!isSeller) return;
    fetchSellerCounts();
    const interval = setInterval(fetchSellerCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isSeller, fetchSellerCounts]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAdminCounts();
    const interval = setInterval(fetchAdminCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isAdmin, fetchAdminCounts]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isPathActive = (itemPath: string) => {
    if (itemPath === "/seller") return pathname === "/seller";
    if (itemPath === "/admin") return pathname === "/admin";
    return pathname.startsWith(itemPath + "/") || pathname === itemPath;
  };

  // Unified menu items - show different items based on role
  const getMenuItems = (): MenuItem[] => {
    const sellerItems: MenuItem[] = [
      { name: "Dashboard", path: "/seller", icon: LayoutDashboard },
      { name: "Add Product", path: "/seller/add-product", icon: Plus },
      { name: "Products", path: "/seller/products", icon: Package, countKey: "totalProducts" },
      { name: "Orders", path: "/seller/orders", icon: ShoppingBag, countKey: "pendingOrders" },
      { name: "Settings", path: "/seller/settings", icon: Settings },
    ];

    const adminItems: MenuItem[] = [
      { name: "Applications", path: "/admin/applications", icon: Users, countKey: "pendingApplications" },
      { name: "Users", path: "/admin/users", icon: Users },
      { name: "All Orders", path: "/admin/orders", icon: ShoppingCart },
      { name: "Reports", path: "/admin/reports", icon: FileText },
    ];

    if (isAdmin) return [...sellerItems, ...adminItems];
    if (isSeller) return sellerItems;
    return [];
  };

  const getCount = (key?: string): number => {
    if (!key) return 0;
    if (key === "pendingApplications") return adminCounts.pendingApplications;
    return sellerCounts[key as keyof SellerCounts] ?? 0;
  };

  const roleLabel = isAdmin ? "Admin" : "Seller";

  if (isLoading || !mounted) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSeller && !isAdmin) return null;

  const menuItems = getMenuItems();

  return (
    <>
      <DesktopSidebar
        menuItems={menuItems}
        getCount={getCount}
        isPathActive={isPathActive}
        roleLabel={roleLabel}
      />
      <MobileSidebar
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
        menuItems={menuItems}
        getCount={getCount}
        isPathActive={isPathActive}
        roleLabel={roleLabel}
      />
      <div className="hidden md:block ml-64" />
    </>
  );
};

export default SideBar;