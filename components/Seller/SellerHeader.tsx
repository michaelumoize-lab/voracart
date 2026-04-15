// components/Seller/SellerHeader.tsx
"use client";

import { Bell, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

export default function SellerHeader() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="md:hidden">
        {/* Mobile menu button would go here */}
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 rounded-lg hover:bg-accent transition">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
        <Link href="/cart" className="relative p-2 rounded-lg hover:bg-accent transition">
          <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}