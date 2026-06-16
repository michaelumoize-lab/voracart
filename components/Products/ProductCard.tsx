// components/Products/ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { ProductRating } from "@/components/ui/product-rating";
import type { SerializedProduct } from "@/lib/serialize";

interface ProductCardProps {
  product: SerializedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const currency = "₦";

  // Use the cart store
  const {
    items: cartItems,
    addToCart,
    updateQuantity,
    loading,
  } = useCartStore();

  if (!product?.id) {
    return null;
  }

  const quantity = cartItems[product.id] || 0;

  // Get the first image from the product's images array or use placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "/placeholder-product.png";

  const displayPrice = product.offerPrice ?? product.price ?? 0;

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!product.id) {
      toast.error("Invalid product");
      return;
    }

    try {
      await addToCart(product.id);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.id) {
      toast.error("Invalid product");
      return;
    }
    try {
      await updateQuantity(product.id, quantity + 1);
    } catch (error) {
      console.error("Update cart failed:", error);
      toast.error("Failed to update cart");
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.id) {
      toast.error("Invalid product");
      return;
    }
    try {
      if (quantity > 1) {
        await updateQuantity(product.id, quantity - 1);
      } else {
        await updateQuantity(product.id, 0);
      }
    } catch (error) {
      console.error("Update cart failed:", error);
      toast.error("Failed to update cart");
    }
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer group"
    >
      {/* Image */}
      <div className="relative bg-muted rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          className="group-hover:scale-105 transition-transform duration-300 object-cover w-4/5 h-4/5 md:w-full md:h-full"
          width={800}
          height={800}
          priority={false}
        />

        {/* Wishlist Button */}
        <button
          className="absolute top-2 right-2 bg-background p-2 rounded-full shadow-md hover:bg-muted transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toast("Wishlist coming soon!", { icon: "💡" });
          }}
        >
          <Heart className="h-3 w-3 text-muted-foreground hover:text-red-500" />
        </button>
      </div>

      {/* Name */}
      <h3 className="text-sm font-medium text-foreground line-clamp-2">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <ProductRating
          rating={product.rating || 0}
          reviewCount={product.reviewCount}
          showCount={true}
          size="sm"
        />
      </div>

      {/* Price + Cart Controls */}
      <div
        className="flex items-center justify-between w-full mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-medium text-foreground">
          {currency}
          {displayPrice.toLocaleString()}
        </p>

        <div className="max-sm:hidden">
          {loading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              Loading...
            </div>
          ) : quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              className="px-4 py-1.5 text-muted-foreground border border-border rounded-full text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              Add to cart
            </button>
          ) : (
            <div className="flex items-center gap-1 border border-primary rounded-full overflow-hidden text-xs">
              <button
                onClick={handleDecrease}
                className="px-2.5 py-1.5 text-primary hover:bg-primary/10 transition font-bold"
              >
                −
              </button>
              <span className="px-1 text-foreground font-medium min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-2.5 py-1.5 text-primary hover:bg-primary/10 transition font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
