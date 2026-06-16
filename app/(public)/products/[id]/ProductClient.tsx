// app/(public)/products/[id]/ProductClient.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ProductRating } from "@/components/ui/product-rating";
import { useCartStore } from "@/stores/cartStore";
import { useLoadingStore } from "@/stores/loadingStore";
import type { Product } from "@/types";
import {
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Store as StoreIcon,
} from "lucide-react";

// The lightbox is only needed once someone clicks the image, so keep it out
// of the initial bundle entirely.
const ImageLightbox = dynamic(
  () => import("@/components/Products/ImageLightbox"),
  { ssr: false },
);

interface ProductClientProps {
  product: Product;
}

const CURRENCY = "₦";

function formatPrice(value: number) {
  return `${CURRENCY}${value.toLocaleString()}`;
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const {
    items: cartItems,
    addToCart,
    updateQuantity,
    loading: cartLoading,
  } = useCartStore();
  const { withLoading } = useLoadingStore();

  // Normalize images to a flat list of URLs, falling back to the single
  // `image` field for products that don't have an `images` relation loaded.
  const productImages: string[] =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [
          (typeof product.images === "string" && product.images) ||
            "/placeholder-product.png",
        ];

  const [mainImage, setMainImage] = useState<string>(productImages[0]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const quantity = cartItems[product.id] || 0;
  const stock = product.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const displayPrice = product.offerPrice ?? product.price;

  const handleDecrease = async () => {
    if (quantity <= 0) return;
    setActionLoading("decrease");
    try {
      await withLoading(async () => {
        await updateQuantity(product.id, quantity - 1);
      }, false);
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIncrease = async () => {
    if (quantity >= stock) return;
    setActionLoading("increase");
    try {
      await withLoading(async () => {
        await updateQuantity(product.id, quantity + 1);
      }, false);
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddWithQuantity = async () => {
    if (isOutOfStock || selectedQuantity <= 0) return;
    setActionLoading("addWithQuantity");
    try {
      await withLoading(async () => {
        if (quantity > 0) {
          await updateQuantity(product.id, quantity + selectedQuantity);
        } else {
          await addToCart(product.id);
          if (selectedQuantity > 1) {
            await updateQuantity(product.id, selectedQuantity);
          }
        }
      }, false);
      setSelectedQuantity(1);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock || selectedQuantity <= 0) return;
    setActionLoading("buyNow");
    try {
      await withLoading(async () => {
        if (quantity > 0) {
          await updateQuantity(product.id, quantity + selectedQuantity);
        } else {
          await addToCart(product.id);
          if (selectedQuantity > 1) {
            await updateQuantity(product.id, selectedQuantity);
          }
        }
      }, false);
      router.push("/cart");
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setActionLoading(null);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  };

  const stockBadge = isOutOfStock
    ? {
        label: "Out of stock",
        className: "bg-destructive text-destructive-foreground",
      }
    : isLowStock
      ? {
          label: `Only ${stock} left`,
          className: "bg-warning text-warning-foreground",
        }
      : { label: "In stock", className: "bg-success text-success-foreground" };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 sm:pb-12 space-y-12 min-h-screen">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <li>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="capitalize hover:text-foreground transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <li
              className="text-foreground font-medium truncate max-w-[55vw] sm:max-w-xs"
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Gallery + info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div>
            <div
              className="relative group rounded-xl overflow-hidden bg-muted mb-4 cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
              onClick={() => openLightbox(productImages.indexOf(mainImage))}
            >
              {product.offerPrice && (
                <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold">
                  Sale
                </span>
              )}
              <span
                className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold ${stockBadge.className}`}
              >
                {stockBadge.label}
              </span>

              <Image
                src={mainImage}
                alt={product.name}
                width={1024}
                height={1024}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                  <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <svg
                      className="w-5 h-5 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                {productImages.map((img, index) => {
                  const isActive = mainImage === img;
                  return (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setMainImage(img)}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-muted transition-all duration-200 ${
                        isActive
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "hover:ring-1 hover:ring-primary/50"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 25vw, 12vw"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Click or tap the image to view full size
            </p>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-primary capitalize">
              {product.category}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-3">
              {(product.rating ?? 0) > 0 ? (
                <>
                  <ProductRating
                    rating={product.rating ?? 0}
                    showCount={false}
                    size="md"
                  />
                  <a
                    href="#reviews"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {(product.rating ?? 0).toFixed(1)} ·{" "}
                    {product.reviewCount ?? 0} review
                    {(product.reviewCount ?? 0) === 1 ? "" : "s"}
                  </a>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No ratings yet</p>
              )}
            </div>

            <p className="text-3xl font-bold mt-4 text-foreground">
              {formatPrice(displayPrice)}
              {product.offerPrice && (
                <span className="text-base font-normal text-muted-foreground line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              )}
            </p>

            <div
              className={`mt-3 inline-flex items-center gap-2 text-sm ${
                isOutOfStock
                  ? "text-destructive"
                  : isLowStock
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {isOutOfStock || isLowStock ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {isOutOfStock
                  ? "Currently out of stock"
                  : isLowStock
                    ? `Hurry! Only ${stock} left in stock`
                    : "In stock, ready to ship"}
              </span>
            </div>

            {product.description && (
              <p className="text-muted-foreground mt-4 leading-relaxed">
                {product.description}
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <hr className="border-border my-6" />

            {/* Quantity selector before adding to cart */}
            {!isOutOfStock && quantity === 0 && (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() =>
                      setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors rounded-l-lg disabled:opacity-50"
                    disabled={selectedQuantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-[50px] text-center text-foreground font-medium">
                    {selectedQuantity}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedQuantity(Math.min(stock, selectedQuantity + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors rounded-r-lg disabled:opacity-50"
                    disabled={selectedQuantity >= stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Cart controls (hidden on small screens — sticky bar takes over) */}
            <div className="hidden sm:flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3.5 px-8 bg-muted text-muted-foreground rounded-lg font-medium cursor-not-allowed"
                >
                  Out of stock
                </button>
              ) : quantity === 0 ? (
                <div className="flex w-full gap-3">
                  <button
                    onClick={handleAddWithQuantity}
                    disabled={
                      actionLoading === "addWithQuantity" || cartLoading
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground hover:bg-accent transition-colors rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading === "addWithQuantity" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart ({selectedQuantity})
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={actionLoading === "buyNow" || cartLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading === "buyNow" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex w-full items-center gap-3">
                  <div className="flex items-center border border-primary rounded-lg">
                    <button
                      onClick={handleDecrease}
                      disabled={actionLoading === "decrease"}
                      className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors rounded-l-lg disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      {actionLoading === "decrease" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </button>
                    <span className="min-w-[50px] text-center text-foreground font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={
                        actionLoading === "increase" || quantity >= stock
                      }
                      className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors rounded-r-lg disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      {actionLoading === "increase" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => router.push("/cart")}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg font-medium"
                  >
                    Go to Cart
                  </button>
                </div>
              )}
            </div>

            {/* Seller / store card */}
            {product.store && (
              <div className="mt-8 rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Sold by
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {product.store.logo ? (
                      <Image
                        src={product.store.logo}
                        alt={product.store.name}
                        width={48}
                        height={48}
                        sizes="48px"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <StoreIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {product.store.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {product.store.rating !== undefined && (
                        <ProductRating
                          rating={product.store.rating}
                          showCount={false}
                          size="sm"
                        />
                      )}
                      {product.store.totalSales !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {product.store.totalSales} sales
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/store/${product.store.slug}`}
                    className="shrink-0 text-sm font-medium text-primary hover:underline"
                  >
                    Visit store
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">
              {product.name}
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatPrice(displayPrice)}
            </p>
          </div>

          {isOutOfStock ? (
            <button
              disabled
              className="shrink-0 px-6 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
            >
              Out of stock
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={handleAddWithQuantity}
              disabled={actionLoading === "addWithQuantity" || cartLoading}
              className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {actionLoading === "addWithQuantity" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              Add to cart
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center border border-primary rounded-lg">
                <button
                  onClick={handleDecrease}
                  disabled={actionLoading === "decrease"}
                  className="w-9 h-9 flex items-center justify-center text-primary disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[28px] text-center text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={actionLoading === "increase" || quantity >= stock}
                  className="w-9 h-9 flex items-center justify-center text-primary disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => router.push("/cart")}
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={productImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
