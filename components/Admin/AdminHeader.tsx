// components/Admin/AdminHeader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ShoppingCart, User, LogOut, Home, Shield, LayoutDashboard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { authClient } from "@/lib/auth-client";
import { useClientSession } from "@/lib/use-session-client";
import { useRole } from "@/lib/auth/helpers";
import ModeToggle from "@/components/ui/mode-toggle";
import toast from "react-hot-toast";

export default function AdminHeader() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { session } = useClientSession();
  const { isAdmin, isSeller } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const user = session?.user;
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  // Get dashboard link based on role
  const dashboardLink = isAdmin ? "/admin" : isSeller ? "/seller" : null;
  const dashboardIcon = isAdmin ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />;
  const dashboardLabel = isAdmin ? "Admin Dashboard" : "Seller Dashboard";

  return (
    <header className="sticky top-0 z-20 bg-background border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="md:hidden" />

      <div className="flex items-center gap-2 ml-auto">
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg hover:bg-accent transition"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>

        <Link href="/cart" className="relative p-2 rounded-lg hover:bg-accent transition">
          <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        <ModeToggle />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:bg-accent transition"
            aria-label="User menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {userName}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5 z-50">
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Homepage
                </Link>

                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    {dashboardIcon}
                    {dashboardLabel}
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}