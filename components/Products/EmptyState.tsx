"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package, Box, Heart, Plus } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionPath?: string;
}

// Default icons for common states using Lucide
const CartEmptyIcon = () => <ShoppingCart className="w-16 h-16 text-muted-foreground" />;
const OrdersEmptyIcon = () => <Package className="w-16 h-16 text-muted-foreground" />;
const ProductsEmptyIcon = () => <Box className="w-16 h-16 text-muted-foreground" />;
const WishlistEmptyIcon = () => <Heart className="w-16 h-16 text-muted-foreground" />;

export { CartEmptyIcon, OrdersEmptyIcon, ProductsEmptyIcon, WishlistEmptyIcon };

const EmptyState = ({ icon, title, subtitle, actionLabel, actionPath }: EmptyStateProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Icon container */}
      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        {icon ?? <ProductsEmptyIcon />}
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>

      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-xs mb-6">{subtitle}</p>
      )}

      {actionLabel && actionPath && (
        <button
          onClick={() => router.push(actionPath)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;