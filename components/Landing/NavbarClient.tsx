"use client";

import React, {
  useState,
  useTransition,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Store,
  Shield,
  Menu,
  X,
} from "lucide-react";
import NotificationBell from "@/components/Landing/NotificationBell";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useClientSession } from "@/lib/use-session-client";
import ModeToggle from "@/components/ui/mode-toggle";

interface NavbarClientProps {
  prefetchedSession?: Session | null;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

// ── Moved outside to avoid "component created during render" error ──

function DropdownLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}

function DashboardNavLink({
  isAdmin,
  isSeller,
  hasPendingApplication,
  pathname,
  user,
}: {
  isAdmin: boolean;
  isSeller: boolean;
  hasPendingApplication: boolean;
  pathname: string;
  user: boolean; // just whether a user exists
}) {
  if (isAdmin) {
    const isActive = pathname.startsWith("/admin");
    return (
      <Link
        href="/admin"
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <Shield className="h-4 w-4" />
        Admin
      </Link>
    );
  }

  if (isSeller) {
    const isActive = pathname.startsWith("/seller");
    return (
      <Link
        href="/seller"
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <LayoutDashboard className="h-4 w-4" />
        Seller
      </Link>
    );
  }

  if (user && !isSeller && !isAdmin) {
    return (
      <Link
        href={hasPendingApplication ? "#" : "/become-seller"}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          hasPendingApplication
            ? "text-muted-foreground opacity-50 cursor-default"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <Store className="h-4 w-4" />
        {hasPendingApplication ? "Pending…" : "Sell"}
      </Link>
    );
  }

  return null;
}

// ── Main Navbar ──

export default function NavbarClient({ prefetchedSession }: NavbarClientProps) {
  const { session: clientSession, isLoading } = useClientSession();

  // Use prefetched session instantly, client session takes over once loaded
  const session = clientSession ?? prefetchedSession ?? null;

  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();

  const user = session?.user ?? null;
  const role: string = (user as { role?: string } | null)?.role ?? "user";
  const isSeller = role === "seller";
  const isAdmin = role === "admin";
  const hasPendingApplication =
    (user as { hasPendingApplication?: boolean } | null)
      ?.hasPendingApplication ?? false;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close any open menus when the route changes.
  useLayoutEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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
        router.refresh();
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-xl font-bold text-primary">
          VoraCart
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

          {/* Role-based link — hidden while loading to prevent flash */}
          {!!session && (
            <DashboardNavLink
              isAdmin={isAdmin}
              isSeller={isSeller}
              hasPendingApplication={hasPendingApplication}
              pathname={pathname}
              user={!!user}
            />
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <NotificationBell />

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Auth area */}
          {isLoading && !prefetchedSession ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-accent" />
          ) : user ? (
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
                    alt={user.name ?? "Avatar"}
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
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5">
                  {/* User info */}
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

                  {/* Links */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <DropdownLink
                      href="/account"
                      icon={<User className="h-4 w-4" />}
                      label="Account"
                      onClose={() => setDropdownOpen(false)}
                    />
                    <DropdownLink
                      href="/my-orders"
                      icon={<ShoppingCart className="h-4 w-4" />}
                      label="My Orders"
                      onClose={() => setDropdownOpen(false)}
                    />

                    {isAdmin && (
                      <DropdownLink
                        href="/admin"
                        icon={<Shield className="h-4 w-4" />}
                        label="Admin Dashboard"
                        onClose={() => setDropdownOpen(false)}
                      />
                    )}

                    {isSeller && !isAdmin && (
                      <DropdownLink
                        href="/seller"
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        label="Seller Dashboard"
                        onClose={() => setDropdownOpen(false)}
                      />
                    )}

                    {!isSeller && !isAdmin && !hasPendingApplication && (
                      <DropdownLink
                        href="/become-seller"
                        icon={<Store className="h-4 w-4" />}
                        label="Become a Seller"
                        onClose={() => setDropdownOpen(false)}
                      />
                    )}

                    {!isSeller && !isAdmin && hasPendingApplication && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground opacity-60 cursor-default">
                        <Store className="h-4 w-4" />
                        Application Pending
                      </div>
                    )}
                  </div>

                  {/* Sign out */}
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

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden border-t border-border bg-background px-4 pb-4 pt-2 flex flex-col gap-1"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}

          {user && (
            <>
              <div className="my-1 border-t border-border" />
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Shield className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
              {isSeller && !isAdmin && (
                <Link
                  href="/seller"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" /> Seller Dashboard
                </Link>
              )}
              {!isSeller && !isAdmin && !hasPendingApplication && (
                <Link
                  href="/become-seller"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Store className="h-4 w-4" /> Become a Seller
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
