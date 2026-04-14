"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

type CartItems = Record<string, number>;

export function useCart(initialCart: CartItems = {}) {
  const [cartItems, setCartItems] = useState<CartItems>(initialCart);
  const [loading, setLoading] = useState(false);
  const pendingOps = useRef(0);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/get");
      const data = await res.json();
      if (data.success) setCartItems(data.cart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const syncCart = async (productId: string, quantity: number) => {
    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Cart update failed");
    }
  };

  const addToCart = async (productId: string) => {
    setLoading(true);
    pendingOps.current++;

    let newQty: number;

    setCartItems((prev) => {
      newQty = (prev[productId] || 0) + 1;
      return { ...prev, [productId]: newQty };
    });


    try {
      await syncCart(productId, newQty!);
    } catch (err) {
      setCartItems((prev) => {
        const updated = { ...prev };
        const revertedQty = (updated[productId] || 1) - 1;
        if (revertedQty <= 0) delete updated[productId];
        else updated[productId] = revertedQty;
        return updated;
      });
      console.error("Failed to add to cart:", err);
      toast.error("Could not update cart. Please try again.");
    } finally {
      pendingOps.current--;
      if (pendingOps.current === 0) setLoading(false);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    const previousCart = { ...cartItems };
    setLoading(true);

    setCartItems((prev) => {
      const updated = { ...prev };
      if (quantity <= 0) delete updated[productId];
      else updated[productId] = quantity;
      return updated;
    });

    try {
      await syncCart(productId, quantity);
    } catch (err) {
      setCartItems(previousCart);
      console.error("Failed to update cart quantity:", err);
      toast.error("Could not update cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  return {
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    loading,
    refreshCart: fetchCart,
  };
}
