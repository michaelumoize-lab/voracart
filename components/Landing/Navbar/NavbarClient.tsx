// components/NavbarClient.tsx (updated)
"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import type { Session } from "@/lib/auth";
import NotificationBell from "./NotificationBell";
import { useCart } from "@/hooks/useCart";

interface Props {
  session: Session | null;
  role: string;
  isSeller: boolean;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function NavbarClient({ session, role, isSeller }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart(); // ✅ Get cartCount directly from hook
  const user = session?.user;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/") },
        });
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="Logo" width={150} height={54} priority />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {isSeller && (
            <Link
              href="/seller"
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                pathname.startsWith("/seller")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Seller Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Shopping cart, ${cartCount} items` : "Shopping cart"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Open user menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2 cursor-pointer rounded-full border border-border px-2 py-1 transition-colors hover:bg-accent"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                    alt={user.name ?? "User avatar"}
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                      {role}
                    </span>
                  </div>

                  <div className="p-1.5 flex flex-col gap-0.5">
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Account
                    </Link>

                    <Link
                      href="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      My Orders
                    </Link>

                    {isSeller && (
                      <Link
                        href="/seller"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Seller Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="p-1.5 border-t border-border">
                    <button
                      onClick={handleSignOut}
                      disabled={isPending}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {isPending ? "Signing out…" : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}