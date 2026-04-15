"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useClientSession } from "@/lib/use-session-client";
import { toast } from "react-hot-toast";

type CartItems = Record<string, number>;

interface CartContextType {
  cartItems: CartItems;
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading: sessionLoading } = useClientSession();
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [loading, setLoading] = useState(true);

  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const fetchCart = useCallback(async () => {
    if (!session?.user) {
      setCartItems({});
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/cart/get");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      if (data.success) setCartItems(data.cart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (!sessionLoading) fetchCart();
  }, [sessionLoading, fetchCart]);

  const syncCart = async (productId: string, quantity: number) => {
    if (!productId) throw new Error("Product ID required");
    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      let msg = "Cart update failed";
      try { const d = await res.json(); msg = d.message || msg; } catch {}
      throw new Error(msg);
    }
  };

  const addToCart = async (productId: string) => {
    if (!productId) {
      toast.error("Invalid product");
      return;
    }
    const currentQty = cartItems[productId] || 0;
    const newQty = currentQty + 1;
    // Optimistic update
    setCartItems(prev => ({ ...prev, [productId]: newQty }));
    try {
      await syncCart(productId, newQty);
      toast.success("Added to cart!");
    } catch (err) {
      // Revert
      setCartItems(prev => {
        const updated = { ...prev };
        const reverted = (updated[productId] || 1) - 1;
        if (reverted <= 0) delete updated[productId];
        else updated[productId] = reverted;
        return updated;
      });
      toast.error(err instanceof Error ? err.message : "Could not update cart");
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!productId) {
      toast.error("Invalid product");
      return;
    }
    const prevQty = cartItems[productId] || 0;
    // Optimistic update
    setCartItems(prev => {
      const updated = { ...prev };
      if (quantity <= 0) delete updated[productId];
      else updated[productId] = quantity;
      return updated;
    });
    try {
      await syncCart(productId, quantity);
      if (quantity === 0) toast.success("Item removed");
      else if (quantity < prevQty) toast.success(`Quantity decreased to ${quantity}`);
      else if (quantity > prevQty) toast.success(`Quantity increased to ${quantity}`);
    } catch (err) {
      // Revert
      setCartItems(prev => ({ ...prev, [productId]: prevQty }));
      toast.error(err instanceof Error ? err.message : "Could not update cart");
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, loading: loading || sessionLoading, addToCart, updateCartQuantity, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}