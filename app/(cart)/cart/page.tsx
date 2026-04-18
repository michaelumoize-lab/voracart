// app/(cart)/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useClientSession } from "@/lib/use-session-client";
import { useLoading } from "@/contexts/LoadingContext";
import toast from "react-hot-toast";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  image: string;
  stock: number;
}

export default function CartPage() {
  const router = useRouter();
  const { session } = useClientSession();
  const {
    cartItems,
    updateCartQuantity,
    cartCount,
    loading: cartLoading,
  } = useCart();
  const { withLoading } = useLoading();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!session?.user && !cartLoading) {
      setIsRedirecting(true);
      router.push("/auth/sign-in?redirect=/cart");
    }
  }, [session, cartLoading, router]);

  useEffect(() => {
    if (!isRedirecting) {
      fetchCartProducts();
    }
  }, [cartItems, isRedirecting]);

  const fetchCartProducts = async () => {
    const productIds = Object.keys(cartItems);
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const productsData = await Promise.all(
        productIds.map(async (id) => {
          try {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) {
              console.error(`Failed to fetch product ${id}: ${res.status}`);
              return null;
            }
            const data = await res.json();
            return data.product;
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
          }
        }),
      );
      const validProducts = productsData.filter((product) => product !== null);
      setProducts(validProducts);
    } catch (error) {
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (productId: string) => cartItems[productId] || 0;

  const getItemPrice = (product: CartProduct) => {
    const price = product.offerPrice || product.price;
    return typeof price === "number" ? price : Number(price);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    setActionLoading(productId);
    try {
      await withLoading(async () => {
        await updateCartQuantity(productId, quantity);
      }, false);
    } finally {
      setActionLoading(null);
    }
  };

  const getItemTotal = (product: CartProduct) => {
    const price = getItemPrice(product);
    const qty = getItemQuantity(product.id);
    return price * qty;
  };

  const subtotal = products.reduce((sum, p) => sum + getItemTotal(p), 0);
  const deliveryFee = 0; // or calculate
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (products.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  if (loading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added any items yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">
        Shopping Cart ({cartCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {products.map((product) => {
            const quantity = getItemQuantity(product.id);
            const price = getItemPrice(product);
            const itemTotal = price * quantity;

            return (
              <div
                key={product.id}
                className="flex gap-4 p-4 bg-card border border-border rounded-lg"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover w-20 h-20"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ${price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(product.id, quantity - 1)
                      }
                      disabled={actionLoading === product.id}
                      className="w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-accent disabled:opacity-50"
                    >
                      {actionLoading === product.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => {
                        if (quantity >= product.stock) return;
                        handleUpdateQuantity(product.id, quantity + 1);
                      }}
                      disabled={
                        actionLoading === product.id ||
                        quantity >= product.stock
                      }
                      className="w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-accent disabled:opacity-50"
                    >
                      {actionLoading === product.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(product.id, 0)}
                      disabled={actionLoading === product.id}
                      className="ml-2 text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-lg p-6 h-fit">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Order Summary
          </h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal ({cartCount} items)
              </span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-foreground">${deliveryFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Proceed to Checkout
          </button>
          <Link
            href="/products"
            className="block text-center text-sm text-primary hover:underline mt-4"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
