"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import SidebarCountBadge from "@/components/Seller/SidebarCountBadge";
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
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const POLL_INTERVAL = 30_000; // 30 seconds

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

interface DesktopSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  menuItems: MenuItem[];
  getCount: (key?: string) => number;
  isPathActive: (path: string) => boolean;
  isAdmin: boolean;
  handleSignOut: () => void;
}

interface MobileSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
  menuItems: MenuItem[];
  getCount: (key?: string) => number;
  isPathActive: (path: string) => boolean;
  isAdmin: boolean;
  handleSignOut: () => void;
}

// Desktop Sidebar Component
const DesktopSidebar = ({
  isCollapsed,
  setIsCollapsed,
  menuItems,
  getCount,
  isPathActive,
  isAdmin,
  handleSignOut,
}: DesktopSidebarProps) => (
  <div
    className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-300 z-30 ${
      isCollapsed ? "w-16" : "w-64"
    }`}
  >
    {/* Logo Area */}
    <div className="flex items-center justify-between p-4 border-b border-border">
      {!isCollapsed && (
        <Link href={isAdmin ? "/admin" : "/seller"} className="font-bold text-xl text-primary">
          VoraCart
        </Link>
      )}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-1 rounded-lg hover:bg-accent transition"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>

    {/* Navigation */}
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
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  <SidebarCountBadge count={count} />
                </>
              )}
            </div>
          </Link>
        );
      })}
    </nav>

    {/* Sign Out Button */}
    <div className="p-4 border-t border-border">
      <button
        onClick={handleSignOut}
        className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        <LogOut className="w-5 h-5 shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
      </button>
    </div>
  </div>
);

// Mobile Sidebar Component
const MobileSidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  menuItems,
  getCount,
  isPathActive,
  isAdmin,
  handleSignOut,
}: MobileSidebarProps) => (
  <>
    {/* Mobile Menu Button */}
    <button
      onClick={() => setIsMobileOpen(true)}
      className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-background border border-border shadow-sm"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5 text-foreground" />
    </button>

    {/* Mobile Overlay */}
    {isMobileOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsMobileOpen(false)}
      />
    )}

    {/* Mobile Sidebar */}
    <div
      className={`md:hidden fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href={isAdmin ? "/admin" : "/seller"} className="font-bold text-xl text-primary">
          VoraCart
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="p-1 rounded-lg hover:bg-accent transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = isPathActive(item.path);
          const count = getCount(item.countKey);
          const Icon = item.icon;

          return (
            <Link href={item.path} key={item.name} onClick={() => setIsMobileOpen(false)}>
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

      {/* Sign Out Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full py-3 px-4 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  </>
);

// Main SideBar Component
const SideBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isSeller, isAdmin, isLoading } = useRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [sellerCounts, setSellerCounts] = useState<SellerCounts>({
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [adminCounts, setAdminCounts] = useState<AdminCounts>({
    pendingApplications: 0,
  });

  // Handle mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSellerCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/counts");
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
      const data = await res.json();
      if (data.success) {
        setAdminCounts({ pendingApplications: data.pendingApplications });
      }
    } catch {
      // silently fail
    }
  }, []);

  // Set up polling for seller counts
  useEffect(() => {
    if (!isSeller) return;
    
    fetchSellerCounts();
    const interval = setInterval(fetchSellerCounts, POLL_INTERVAL);
    
    return () => {
      clearInterval(interval);
    };
  }, [isSeller, fetchSellerCounts]);

  // Set up polling for admin counts
  useEffect(() => {
    if (!isAdmin) return;
    
    fetchAdminCounts();
    const interval = setInterval(fetchAdminCounts, POLL_INTERVAL);
    
    return () => {
      clearInterval(interval);
    };
  }, [isAdmin, fetchAdminCounts]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Helper function to check if a path is active
  const isPathActive = (itemPath: string) => {
    if (itemPath === "/seller") {
      return pathname === "/seller";
    }
    if (itemPath === "/admin") {
      return pathname === "/admin";
    }
    // For nested routes like /seller/products, /seller/products/123/edit
    return pathname.startsWith(itemPath + "/") || pathname === itemPath;
  };

  const sellerMenuItems: MenuItem[] = [
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

  const adminMenuItems: MenuItem[] = [
    {
      name: "Applications",
      path: "/admin/applications",
      icon: Users,
      countKey: "pendingApplications",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "All Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: FileText,
    },
  ];

  // Show loading state while checking role
  if (isLoading || !mounted) {
    return (
      <div className="fixed left-0 top-0 h-full md:w-64 w-16 border-r border-border bg-background py-2 flex flex-col items-center pt-4">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not seller or admin
  if (!isSeller && !isAdmin) {
    return null;
  }

  const menuItems = isAdmin
    ? [...sellerMenuItems, ...adminMenuItems]
    : sellerMenuItems;

  const getCount = (key?: string): number => {
    if (!key) return 0;
    if (key === "pendingApplications") return adminCounts.pendingApplications;
    return sellerCounts[key as keyof SellerCounts] ?? 0;
  };

  return (
    <>
      <DesktopSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        menuItems={menuItems}
        getCount={getCount}
        isPathActive={isPathActive}
        isAdmin={isAdmin}
        handleSignOut={handleSignOut}
      />
      <MobileSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        menuItems={menuItems}
        getCount={getCount}
        isPathActive={isPathActive}
        isAdmin={isAdmin}
        handleSignOut={handleSignOut}
      />
      {/* Main content offset */}
      <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`} />
    </>
  );
};

export default SideBar;