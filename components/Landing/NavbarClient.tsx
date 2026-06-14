"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import NotificationBell from "@/components/Landing/NotificationBell";
import { useCartStore } from "@/stores/cartStore";
import { useClientSession } from "@/lib/use-session-client";
import ModeToggle from "@/components/ui/mode-toggle";
import { UserButton } from "@/components/user/user-button";
import type { Session } from "@/lib/auth";

interface NavbarClientProps {
  prefetchedSession?: Session | null;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function NavbarClient({ prefetchedSession }: NavbarClientProps) {
  const { session: clientSession, isLoading: sessionLoading } =
    useClientSession();

  const session = clientSession ?? prefetchedSession ?? null;
  const pathname = usePathname();

  const cartCount = useCartStore((state) => state.cartCount);
  const cartLoading = useCartStore((state) => state.loading);

  const user = session?.user ?? null;
  const role: string = (user as { role?: string } | null)?.role ?? "user";
  const isSeller = role === "seller";
  const isAdmin = role === "admin";
  const hasPendingApplication =
    (user as { hasPendingApplication?: boolean } | null)
      ?.hasPendingApplication ?? false;

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

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-3.5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
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
            {!cartLoading && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* User button — handles all auth + profile actions */}
          {sessionLoading && !prefetchedSession ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-accent" />
          ) : (
            <UserButton
              size="icon"
              align="end"
              sideOffset={8}
              isSeller={isSeller}
              isAdmin={isAdmin}
              hasPendingApplication={hasPendingApplication}
            />
          )}
        </div>
      </div>

      {/* Mobile nav links — scrollable row below the header bar */}
      <div className="flex items-center gap-0.5 overflow-x-auto px-4 pb-2 scrollbar-none md:hidden">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 px-3 py-1 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
