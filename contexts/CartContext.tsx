// contexts/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/get");
      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cart);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const syncCart = async (productId: string, quantity: number) => {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    if (typeof quantity !== "number" || isNaN(quantity)) {
      throw new Error(`Invalid quantity: ${quantity}`);
    }

    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) {
      let message = "Cart update failed";
      try {
        const data = await res.json();
        message = data.message || message;
      } catch {
        // Response body wasn't valid JSON
      }
      throw new Error(message);
    }
  };

  const addToCart = async (productId: string) => {
    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    setLoading(true);

    const currentQty = cartItems[productId] || 0;
    const newQty = currentQty + 1;

    // Optimistic update
    setCartItems((prev) => ({
      ...prev,
      [productId]: newQty,
    }));

    try {
      await syncCart(productId, newQty);
      toast.success("Added to cart!");
    } catch (err) {
      // Revert on error
      setCartItems((prev) => {
        const updated = { ...prev };
        const revertedQty = (updated[productId] || 1) - 1;
        if (revertedQty <= 0) delete updated[productId];
        else updated[productId] = revertedQty;
        return updated;
      });
      console.error("Failed to add to cart:", err);
      toast.error(err instanceof Error ? err.message : "Could not update cart");
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    const previousCart = { ...cartItems };
    const previousQuantity = cartItems[productId] || 0;
    setLoading(true);

    setCartItems((prev) => {
      const updated = { ...prev };
      if (quantity <= 0) delete updated[productId];
      else updated[productId] = quantity;
      return updated;
    });

    try {
      await syncCart(productId, quantity);

      // Show appropriate toast based on the action
      if (quantity === 0) {
        toast.success("Item removed from cart");
      } else if (quantity < previousQuantity) {
        toast.success(`Quantity decreased to ${quantity}`);
      } else if (quantity > previousQuantity) {
        toast.success(`Quantity increased to ${quantity}`);
      }
    } catch (err) {
      setCartItems((prev) => {
        const updated = { ...prev };
        if (previousQuantity <= 0) {
          delete updated[productId];
        } else {
          updated[productId] = previousQuantity;
        }
        return updated;
      });
      console.error("Failed to update cart quantity:", err);
      toast.error(err instanceof Error ? err.message : "Could not update cart");
    } finally {
      setLoading(false);
    }
  };

  // Don't render until initial fetch is complete to avoid hydration mismatches
  if (!isInitialized) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateCartQuantity,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
