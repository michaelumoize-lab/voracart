"use client";

// app/(public)/products/[id]/ProductClient.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/Products/ProductCard";
import Footer from "@/components/Landing/Footer";
import { Product } from "@/types";
import { ProductDetailSkeleton } from "@/components/Products/ProductsSkeletons";
import ImageLightbox from "@/components/Products/ImageLightbox";
import { useCart } from "@/hooks/useCart";
import { useClientSession } from "@/lib/use-session-client";
import { useLoading } from "@/contexts/LoadingContext";
import {
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductClient({
  product,
  relatedProducts,
}: ProductClientProps) {
  const router = useRouter();
  const { cartItems, addToCart, updateCartQuantity } = useCart();
  const { isLoading: sessionLoading } = useClientSession();
  const { withLoading } = useLoading();

  const [mainImage, setMainImage] = useState<string | null>(
    Array.isArray(product?.image) ? product.image[0] ?? null : product?.image ?? null,
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ✅ Add quantity selector state (for before adding to cart)
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const quantity = cartItems[product.id] || 0;
  const stock = product.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const averageRating = product.rating ?? null;
  const reviewCount = 0; // Replace with actual count from reviews

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    setActionLoading("add");
    await withLoading(async () => {
      await addToCart(product.id);
    }, false);
    setActionLoading(null);
  };

  const handleDecrease = async () => {
    if (!product || quantity <= 0) return;
    setActionLoading("decrease");
    await withLoading(async () => {
      await updateCartQuantity(product.id, quantity - 1);
    }, false);
    setActionLoading(null);
  };

  const handleIncrease = async () => {
    if (!product || quantity >= stock) return;
    setActionLoading("increase");
    await withLoading(async () => {
      await updateCartQuantity(product.id, quantity + 1);
    }, false);
    setActionLoading(null);
  };

  // ✅ New: Add with specific quantity
  const handleAddWithQuantity = async () => {
    if (!product || isOutOfStock || selectedQuantity <= 0) return;
    setActionLoading("addWithQuantity");
    await withLoading(async () => {
      await updateCartQuantity(product.id, quantity + selectedQuantity);
    }, false);
    setSelectedQuantity(1);
    setActionLoading(null);
  };

  const handleBuyNow = async () => {
    if (!product || isOutOfStock || selectedQuantity <= 0) return;
    setActionLoading("buyNow");
    await withLoading(async () => {
      await updateCartQuantity(product.id, quantity + selectedQuantity);
    }, false);
    setActionLoading(null);
    router.push("/cart");
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Get image URL (handle both string and array)
  const getImageUrl = (image: string | string[]) => {
    return Array.isArray(image) ? image[0] : image;
  };

  // ✅ Render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Image
                key={i}
                className="h-4 w-4"
                src={assets.star_icon}
                alt="star"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <Image
                key={i}
                className="h-4 w-4"
                src={assets.star_dull_icon || assets.star_icon}
                alt="half star"
              />
            );
          } else {
            return (
              <Image
                key={i}
                className="h-4 w-4"
                src={assets.star_dull_icon}
                alt="empty star"
              />
            );
          }
        })}
      </div>
    );
  };

  if (sessionLoading) {
    return (
      <>
        <ProductDetailSkeleton />
        <Footer />
      </>
    );
  }

  const productImages = Array.isArray(product.image)
    ? product.image
    : [product.image];

  return (
    <>
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image gallery */}
          <div className="px-4 lg:px-8">
            <div className="relative">
              {/* Sale Badge */}
              {product.offerPrice && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  SALE
                </div>
              )}

              {/* ✅ Stock Status Badge */}
              {isOutOfStock ? (
                <div className="absolute top-4 right-4 z-10 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Only {stock} left
                </div>
              ) : (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  In Stock
                </div>
              )}

              <div
                className="relative group rounded-xl overflow-hidden bg-muted mb-4 cursor-zoom-in shadow-md hover:shadow-xl transition-shadow"
                onClick={() =>
                  openLightbox(
                    productImages.indexOf(mainImage || productImages[0]),
                  )
                }
              >
                <Image
                  src={getImageUrl(mainImage || productImages[0])}
                  alt={product.name}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  width={1280}
                  height={720}
                  priority
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <svg
                        className="w-6 h-6 text-gray-800"
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
            </div>

            {/* Thumbnails */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => {
                  const isActive = (mainImage || productImages[0]) === image;
                  return (
                    <div
                      key={index}
                      onClick={() => setMainImage(image)}
                      className={`
                        relative group cursor-pointer rounded-lg overflow-hidden bg-muted
                        transition-all duration-200
                        ${
                          isActive
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md"
                            : "hover:ring-1 hover:ring-primary/50"
                        }
                      `}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                        width={300}
                        height={300}
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Click or tap image to view full size
            </p>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* ✅ Rating - Using actual rating */}
            <div className="flex items-center gap-2">
              {averageRating !== null ? (
                <>
                  {renderStars(averageRating)}
                  <p className="text-muted-foreground">
                    {averageRating.toFixed(1)}
                    {reviewCount > 0 && ` (${reviewCount} reviews)`}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No ratings yet</p>
              )}
            </div>

            {/* ✅ Stock Status Message */}
            {isOutOfStock ? (
              <div className="mt-3 flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Currently out of stock</span>
              </div>
            ) : isLowStock ? (
              <div className="mt-3 flex items-center gap-2 text-orange-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Hurry! Only {stock} left in stock
                </span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-green-500">
                <Check className="w-4 h-4" />
                <span className="text-sm">In stock, ready to ship</span>
              </div>
            )}

            <p className="text-muted-foreground mt-3">{product.description}</p>

            <p className="text-3xl font-bold mt-6 text-foreground">
              ${product.offerPrice || product.price}
              {product.offerPrice && (
                <span className="text-base font-normal text-muted-foreground line-through ml-2">
                  ${product.price}
                </span>
              )}
            </p>

            <hr className="border-border my-6" />

            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  {[
                    ["Brand", "Generic"],
                    ["Color", "Multi"],
                    ["Category", product.category],
                    ["Stock", isOutOfStock ? "Out of Stock" : `${stock} units`],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="text-muted-foreground font-medium pr-6 py-1">
                        {k}
                      </td>
                      <td className="text-muted-foreground">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Quantity Selector (before adding to cart) */}
            {!isOutOfStock && quantity === 0 && (
              <div className="flex items-center gap-4 mt-4">
                <span className="text-muted-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() =>
                      setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-accent transition rounded-l-lg"
                    disabled={selectedQuantity <= 1}
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
                    className="w-10 h-10 flex items-center justify-center hover:bg-accent transition rounded-r-lg"
                    disabled={selectedQuantity >= stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Cart Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3.5 px-8 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : quantity === 0 ? (
                <div className="flex w-full sm:w-auto gap-4">
                  <button
                    onClick={handleAddWithQuantity}
                    disabled={actionLoading === "addWithQuantity"}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-muted text-foreground hover:bg-accent transition rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading === "addWithQuantity" ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart ({selectedQuantity})
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={actionLoading === "buyNow"}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition rounded-lg font-medium disabled:opacity-50"
                  >
                    {actionLoading === "buyNow" ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex w-full sm:w-auto items-center gap-4">
                  <div className="flex items-center border border-primary rounded-lg">
                    <button
                      onClick={handleDecrease}
                      disabled={actionLoading === "decrease"}
                      className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 transition rounded-l-lg disabled:opacity-50"
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
                      disabled={actionLoading === "increase"}
                      className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 transition rounded-r-lg disabled:opacity-50"
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
                    className="flex-1 px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition rounded-lg font-medium"
                  >
                    Go to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="flex flex-col items-center pb-14">
            <div className="flex flex-col items-center mb-4 mt-16">
              <p className="text-3xl font-bold text-foreground">
                Related <span className="text-primary">Products</span>
              </p>
              <div className="w-28 h-0.5 bg-primary mt-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 w-full">
              {relatedProducts.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
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
