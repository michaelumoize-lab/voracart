// app/(cart)/checkout/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
  seller?: {
    id: string;
    name: string;
    whatsappNumber?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { session } = useClientSession();
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const { withLoading } = useLoading();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!session?.user && !cartLoading) {
      router.push("/auth/sign-in?redirect=/checkout");
    }
  }, [session, cartLoading, router]);

  const fetchCartProducts = useCallback(async () => {
    const productIds = Object.keys(cartItems);
    if (productIds.length === 0) {
      router.push("/cart");
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
      console.error("Failed to load cart items", error);
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  }, [cartItems, router]);

  useEffect(() => {
    fetchCartProducts();
  }, [fetchCartProducts]);

  const getItemPrice = (product: CartProduct) =>
    product.offerPrice || product.price;

  const subtotal = products.reduce(
    (sum, p) => sum + getItemPrice(p) * (cartItems[p.id] || 0),
    0,
  );
  const total = subtotal; // + delivery fee if any

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await withLoading(async () => {
        // Create order via API
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: products.map((p) => ({
              productId: p.id,
              quantity: cartItems[p.id],
              price: Number(getItemPrice(p)),
            })),
            totalAmount: Number(total),
            shippingDetails: {
              name: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            },
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Order failed");

        // ✅ Get unique seller WhatsApp numbers from all products
        const sellerNumbers = Array.from(
          new Set(
            products
              .map((p) => p.seller?.whatsappNumber?.trim())
              .filter((value): value is string => Boolean(value)),
          ),
        );

        // ✅ Format WhatsApp number (remove non-digit characters and add +)
        const formatWhatsAppNumber = (num: string) => {
          const cleaned = num.replace(/\D/g, "");
          return cleaned ? `+${cleaned}` : "";
        };

        // Prepare order details message
        const orderItems = products
          .map((p) => {
            const qty = cartItems[p.id];
            const price = getItemPrice(p);
            return `${encodeURIComponent(p.name)} x${qty} = $${(price * qty).toFixed(2)}`;
          })
          .join("%0A");

        const baseMessage = `🛒 *New Order from VoraCart*%0A%0A*Customer:* ${encodeURIComponent(formData.fullName)}%0A*Phone:* ${encodeURIComponent(formData.phone)}%0A*Address:* ${encodeURIComponent(formData.address)}, ${encodeURIComponent(formData.city)}, ${encodeURIComponent(formData.state)} - ${encodeURIComponent(formData.pincode)}%0A%0A*Items:*%0A${orderItems}%0A%0A*Total:* $${total.toFixed(2)}%0A%0A*Order ID:* ${data.order.id.slice(-8)}%0A%0AThank you for shopping with us!`;

        // ✅ Handle seller contact cases
        if (sellerNumbers.length === 0) {
          toast.success(
            "Order placed! Seller contact is not configured. Please check My Orders or contact support.",
          );
          clearCart();
          router.push("/my-orders");
        } else if (sellerNumbers.length === 1) {
          const whatsappNumber = formatWhatsAppNumber(sellerNumbers[0]);

          if (!whatsappNumber) {
            toast.success(
              "Order placed! Seller contact is not configured. Please check My Orders or contact support.",
            );
            clearCart();
            router.push("/my-orders");
          } else {
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${baseMessage}`;
            window.open(whatsappUrl, "_blank");
            toast.success("Order placed! Redirecting to WhatsApp...");
            clearCart();
            router.push("/my-orders");
          }
        } else {
          toast.success(
            "Order placed! This order contains multiple sellers. Please check My Orders for details.",
          );
          clearCart();
          router.push("/my-orders");
        }
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Shipping Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Place Order via WhatsApp"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-lg p-6 h-fit">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {products.map((product) => {
              const qty = cartItems[product.id];
              const price = getItemPrice(product);
              return (
                <div key={product.id} className="flex gap-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Qty: {qty}</p>
                  </div>
                  <p className="text-sm font-medium">
                    ${(price * qty).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
