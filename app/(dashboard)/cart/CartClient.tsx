// app/(cart)/cart/CartClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import type { ProductListItem } from "@/types";
import type { SerializedSettings } from "@/lib/serialize";

interface CartItemWithDetails extends ProductListItem {
  quantity: number;
  totalPrice: number;
}

interface CartClientProps {
  initialSettings: SerializedSettings | null; // ← Change here
}

// Delete confirmation modal for single item
function DeleteItemModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-center text-foreground">
            Remove item?
          </h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">{itemName}</span> from
            your cart?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// Clear cart confirmation modal
function ClearCartModal({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-center text-foreground">
            Clear entire cart?
          </h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            You have {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart.
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartClient({ initialSettings }: CartClientProps) {
  const router = useRouter();
  const {
    items: cartItems,
    loading: cartLoading,
    isHydrated,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const [products, setProducts] = useState<CartItemWithDetails[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItemWithDetails | null>(
    null,
  );
  const [settings] = useState<SerializedSettings | null>(initialSettings);

  // Initial load: fetch cart and product details once
  useEffect(() => {
    if (isHydrated) {
      fetchCart().finally(() => setLoadingInitial(false));
    }
  }, [isHydrated, fetchCart]);

  // Fetch product details when cart items change (only when new products added)
  useEffect(() => {
    const productIds = Object.keys(cartItems);
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }

    const existingIds = new Set(products.map((p) => p.id));
    const needsRefetch = productIds.some((id) => !existingIds.has(id));

    if (!needsRefetch) {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          quantity: cartItems[p.id] || 0,
          totalPrice: (p.offerPrice ?? p.price) * (cartItems[p.id] || 0),
        })),
      );
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `/api/products/batch?ids=${productIds.join(",")}`,
        );
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();
        if (data.success) {
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
        console.error("Error fetching cart details:", error);
        toast.error("Could not load cart items. Please refresh.");
      }
    };

    fetchProducts();
  }, [cartItems]);

  const handleQuantityChange = useCallback(
    async (productId: string, newQuantity: number) => {
      if (newQuantity < 1) return;
      setUpdatingItemId(productId);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                quantity: newQuantity,
                totalPrice: (p.offerPrice ?? p.price) * newQuantity,
              }
            : p,
        ),
      );

      try {
        await updateQuantity(productId, newQuantity);
      } catch (error) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === productId) {
              const originalQty = cartItems[productId] || 0;
              return {
                ...p,
                quantity: originalQty,
                totalPrice: (p.offerPrice ?? p.price) * originalQty,
              };
            }
            return p;
          }),
        );
        toast.error("Failed to update quantity");
      } finally {
        setUpdatingItemId(null);
      }
    },
    [updateQuantity, cartItems],
  );

  const handleRemoveClick = (item: CartItemWithDetails) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToDelete) return;
    setUpdatingItemId(itemToDelete.id);

    setProducts((prev) => prev.filter((p) => p.id !== itemToDelete.id));

    try {
      await removeItem(itemToDelete.id);
      toast.success(`${itemToDelete.name} removed`);
    } catch (error) {
      toast.error("Failed to remove item");
      const productIds = Object.keys(cartItems);
      if (productIds.length) {
        const response = await fetch(
          `/api/products/batch?ids=${productIds.join(",")}`,
        );
        const data = await response.json();
        if (data.success) {
          const itemsWithDetails = data.products.map((p: ProductListItem) => ({
            ...p,
            quantity: cartItems[p.id] || 0,
            totalPrice: (p.offerPrice ?? p.price) * (cartItems[p.id] || 0),
          }));
          setProducts(itemsWithDetails);
        }
      }
    } finally {
      setUpdatingItemId(null);
      setItemToDelete(null);
    }
  };

  const handleClearCartClick = () => {
    setClearCartModalOpen(true);
  };

  const handleConfirmClearCart = async () => {
    setUpdatingItemId("clear-all");
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    } finally {
      setUpdatingItemId(null);
    }
  };

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

  // Loading state
  if (!isHydrated || loadingInitial || cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-24 h-24 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {products.map((item) => {
                const price = item.offerPrice ?? item.price;
                const isUpdating = updatingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-card"
                  >
                    <Link
                      href={`/products/${item.id}`}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden bg-muted flex-shrink-0"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.id}`}
                        className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {item.category}
                      </p>
                      <p className="text-lg font-bold text-foreground mt-2">
                        ₦{price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isUpdating || item.quantity <= 1}
                          className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-foreground font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isUpdating}
                          className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveClick(item)}
                        disabled={isUpdating}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="sm:hidden flex justify-between items-center pt-2 border-t border-border mt-2">
                      <span className="text-sm text-muted-foreground">
                        Item total:
                      </span>
                      <span className="text-base font-semibold text-foreground">
                        ₦{item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-base font-semibold text-foreground">
                        ₦{item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end">
                <button
                  onClick={handleClearCartClick}
                  className="text-sm text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear cart
                </button>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-border rounded-lg p-6 bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground font-medium">
                      {shipping > 0 ? `₦${shipping.toLocaleString()}` : "Free"}
                    </span>
                  </div>
                  {subtotal > 0 && (
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between text-base font-bold">
                        <span>Total</span>
                        <span>₦{total.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Taxes included where applicable
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/products"
                  className="mt-3 w-full inline-block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteItemModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmRemove}
        itemName={itemToDelete?.name ?? ""}
      />

      <ClearCartModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onConfirm={handleConfirmClearCart}
        itemCount={products.length}
      />
    </>
  );
}
