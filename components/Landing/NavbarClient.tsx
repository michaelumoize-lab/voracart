// components/Landing/NavbarClient.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import NotificationBell from "@/components/Landing/NotificationBell";
import { useCartStore } from "@/stores/cartStore";
import ModeToggle from "@/components/ui/mode-toggle";
import { UserButton } from "@/components/user/user-button";

interface SerializedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "buyer" | "seller" | "admin";
  hasPendingApplication: boolean;
  storeSlug?: string;
}

interface NavbarClientProps {
  prefetchedUser?: SerializedUser | null;
}

// Base navigation links (static)
const BASE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

type NavLink = {
  href: string;
  label: string;
  highlight?: boolean;
};

export default function NavbarClient({ prefetchedUser }: NavbarClientProps) {
  const pathname = usePathname();

  const cartCount = useCartStore((state) => state.cartCount);
  const cartLoading = useCartStore((state) => state.loading);
  const isHydrated = useCartStore((state) => state.isHydrated);

  // Build conditional dashboard link based on user role
  const { role, storeSlug } = useMemo(
    () => ({
      role: prefetchedUser?.role,
      storeSlug: prefetchedUser?.storeSlug,
    }),
    [prefetchedUser],
  );

  const dashboardLink: NavLink | null = useMemo(() => {
    if (role === "admin") {
      return { href: "/admin", label: "Admin Dashboard", highlight: true };
    }
    if (role === "seller") {
      return {
        href: storeSlug ? `/seller/${storeSlug}` : "/seller",
        label: "Seller Dashboard",
        highlight: true,
      };
    }
    if (role === "buyer") {
      return {
        href: "/become-seller",
        label: "Become Seller",
        highlight: true,
      };
    }
    return null;
  }, [role, storeSlug]);

  // Combine base links with the conditional dashboard link (if present)
  const allNavLinks: NavLink[] = useMemo(() => {
    if (dashboardLink) {
      return [...BASE_NAV_LINKS, dashboardLink];
    }
    return [...BASE_NAV_LINKS];
  }, [dashboardLink]);

  // Desktop nav links (memoized)
  const desktopNavLinks = useMemo(
    () =>
      allNavLinks.map(({ href, label, highlight }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "text-primary"
                : highlight
                  ? "text-primary hover:text-primary-foreground hover:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {label}
            {isActive && !highlight && (
              <span className="absolute bottom-0.5 left-1/2 h-0.5 w-3.5 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </Link>
        );
      }),
    [pathname, allNavLinks],
  );

  // Mobile nav links (memoized, no underline or highlight indicator needed)
  const mobileNavLinks = useMemo(
    () =>
      allNavLinks.map(({ href, label, highlight }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 px-3 py-1 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? "text-primary bg-primary/8"
                : highlight
                  ? "text-primary border border-primary/30 bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {label}
          </Link>
        );
      }),
    [pathname, allNavLinks],
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-lg font-bold text-primary tracking-tight"
        >
          VoraCart
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {desktopNavLinks}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ModeToggle />
          <NotificationBell />

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {!cartLoading && isHydrated && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* User button */}
          <UserButton
            size="icon"
            align="end"
            sideOffset={8}
            isSeller={role === "seller"}
            isAdmin={role === "admin"}
            hasPendingApplication={
              prefetchedUser?.hasPendingApplication ?? false
            }
          />
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="flex items-center gap-0.5 overflow-x-auto px-4 pb-2 scrollbar-none md:hidden">
        {mobileNavLinks}
      </div>
    </nav>
  );
}
