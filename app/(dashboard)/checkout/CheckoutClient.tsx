// app/(dashboard)/checkout/CheckoutClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { useLoadingStore } from "@/stores/loadingStore";
import type { ProductListItem } from "@/types";
import type { SerializedAddress, SerializedSettings } from "@/lib/serialize";

interface CartItemWithDetails extends ProductListItem {
  quantity: number;
  totalPrice: number;
}

interface CheckoutClientProps {
  userId: string;
  initialAddresses: SerializedAddress[];
  initialSettings: SerializedSettings | null;
}

// Skeleton components
function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
      <div className="h-5 w-24 bg-muted rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between mb-4">
              <div className="h-7 w-40 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-5 w-32 bg-muted rounded mt-4" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 h-fit">
          <div className="h-6 w-32 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
            <div className="h-10 w-full bg-muted rounded mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 text-center animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mx-auto mb-4" />
      <div className="h-4 w-64 bg-muted rounded mx-auto" />
      <div className="h-10 w-40 bg-muted rounded mx-auto mt-6" />
    </div>
  );
}

export default function CheckoutClient({
  userId,
  initialAddresses,
  initialSettings,
}: CheckoutClientProps) {
  const router = useRouter();
  const {
    items: cartItems,
    loading: cartLoading,
    isHydrated,
    clearCart,
    fetchCart,
  } = useCartStore();
  const { withLoading } = useLoadingStore();

  const [products, setProducts] = useState<CartItemWithDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Use server-fetched data as initial state
  const [addresses] = useState<SerializedAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => {
      const defaultAddress = initialAddresses.find((a) => a.isDefault);
      return defaultAddress?.id || initialAddresses[0]?.id || null;
    },
  );
  const [settings] = useState<SerializedSettings | null>(initialSettings);

  // 1. Hydrate cart and fetch initial data
  useEffect(() => {
    if (isHydrated) {
      fetchCart();
    }
  }, [isHydrated, fetchCart]);

  // 2. Fetch product details for cart items (batch)
  const fetchCartProducts = useCallback(async () => {
    const productIds = Object.keys(cartItems);
    if (productIds.length === 0) {
      setProducts([]);
      setLoadingDetails(false);
      router.push("/cart");
      return;
    }

    try {
      const response = await fetch(
        `/api/products/batch?ids=${productIds.join(",")}`,
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      if (data.success && data.products) {
        const itemsWithDetails: CartItemWithDetails[] = data.products.map(
          (p: ProductListItem) => ({
            ...p,
            quantity: cartItems[p.id] || 0,
            totalPrice: (p.offerPrice ?? p.price) * (cartItems[p.id] || 0),
          }),
        );
        setProducts(itemsWithDetails);
      } else {
        throw new Error(data.error || "Failed to load cart items");
      }
    } catch (error) {
      console.error("Error fetching cart products:", error);
      toast.error("Could not load cart items. Please refresh.");
    } finally {
      setLoadingDetails(false);
    }
  }, [cartItems, router]);

  useEffect(() => {
    if (isHydrated && !cartLoading && Object.keys(cartItems).length > 0) {
      fetchCartProducts();
    } else if (
      isHydrated &&
      !cartLoading &&
      Object.keys(cartItems).length === 0
    ) {
      setLoadingDetails(false);
      router.push("/cart");
    }
  }, [isHydrated, cartLoading, cartItems, fetchCartProducts, router]);

  // Calculate subtotal and shipping
  const subtotal = products.reduce((sum, item) => sum + item.totalPrice, 0);
  const calculateShipping = useCallback(() => {
    if (!settings) return 0;
    const { shippingFee, freeShippingThreshold } = settings;
    if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
      return 0;
    }
    return shippingFee;
  }, [settings, subtotal]);

  const shipping = calculateShipping();
  const total = subtotal + shipping;

  const handleSubmit = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    if (products.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      await withLoading(async () => {
        // Build order payload matching your schema
        const orderItems = products
          .map((p) => ({
            productId: p.id,
            quantity: p.quantity,
            unitPrice: p.offerPrice ?? p.price,
            storeId: p.storeId,
          }))
          .filter((item) => item.storeId); // Remove items without valid storeId

        if (orderItems.length === 0) {
          toast.error(
            "Unable to process order: products missing store information",
          );
          return;
        }
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: orderItems,
            subtotal: subtotal,
            shippingFee: shipping,
            discountAmount: 0,
            totalAmount: total,
            shippingAddressId: selectedAddressId,
            paymentMethod: "card",
            notes: null,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Order failed");
        }

        // Clear cart after successful order
        await clearCart();
        toast.success("Order placed successfully!");
        router.push(`/my-orders/${data.order?.id || ""}`);
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to place order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading states
  const isLoading = !isHydrated || cartLoading || loadingDetails;

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (products.length === 0) {
    return <EmptyCartSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Shipping */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Shipping Address
              </h2>
              <Link
                href="/my-addresses"
                className="text-sm text-primary hover:underline"
              >
                Manage addresses
              </Link>
            </div>

            {/* Saved addresses */}
            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {addr.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {addr.phone}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[addr.address, addr.city, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {addr.isDefault && (
                        <span className="text-xs text-primary font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    {selectedAddressId === addr.id && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved addresses yet</p>
              </div>
            )}

            {/* Add new address link */}
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href="/my-addresses"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add a new address
              </Link>
            </div>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="bg-card border border-border rounded-lg p-6 h-fit">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {products.map((product) => (
              <div key={product.id} className="flex gap-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {product.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium whitespace-nowrap">
                  ₦{product.totalPrice.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shipping > 0 ? `₦${shipping.toLocaleString()}` : "Free"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting || !selectedAddressId || addresses.length === 0
              }
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
