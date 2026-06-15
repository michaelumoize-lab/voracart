// stores/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

type CartItems = Record<string, number>;

interface CartStore {
  items: CartItems;
  loading: boolean;
  isHydrated: boolean;
  cartCount: number;

  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  setHydrated: (state: boolean) => void;
}

const getCartCount = (items: CartItems): number =>
  Object.values(items).reduce((sum, qty) => sum + qty, 0);

// Helper to show login prompt toast
const showLoginToast = () => {
  toast.error("Please log in to manage your cart", {
    action: {
      label: "Login",
      onClick: () => {
        window.location.href = "/auth/sign-in";
      },
    },
    duration: 5000,
  });
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: {},
      loading: false,
      isHydrated: false,
      cartCount: 0,

      setHydrated: (state) => set({ isHydrated: state }),

      // GET /api/cart - fetch cart
      fetchCart: async () => {
        set({ loading: true });
        try {
          const response = await fetch("/api/cart", {
            credentials: "include",
          });

          if (response.status === 401) {
            set({ items: {}, cartCount: 0, loading: false });
            return;
          }

          if (!response.ok) throw new Error("Failed to fetch cart");
          const data = await response.json();

          if (data.success) {
            const items = data.cart || {};
            set({
              items,
              cartCount: getCartCount(items),
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          set({ loading: false });
        }
      },

      // POST /api/cart - add or update item
      addToCart: async (productId: string) => {
        if (!productId) {
          toast.error("Invalid product");
          return;
        }

        const currentItems = get().items;
        const currentQty = currentItems[productId] || 0;
        const newQty = currentQty + 1;

        // Optimistic update
        const newItems = { ...currentItems, [productId]: newQty };
        set({
          items: newItems,
          cartCount: getCartCount(newItems),
        });

        try {
          const response = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId, quantity: newQty }),
          });

          if (response.status === 401) {
            // Revert optimistic update
            const revertedItems = { ...currentItems };
            if (currentQty === 0) delete revertedItems[productId];
            else revertedItems[productId] = currentQty;
            set({
              items: revertedItems,
              cartCount: getCartCount(revertedItems),
            });
            showLoginToast();
            return;
          }

          if (!response.ok) throw new Error("Failed to update cart");
          toast.success("Added to cart!");
        } catch (error) {
          // Revert optimistic update
          const revertedItems = { ...currentItems };
          if (currentQty === 0) delete revertedItems[productId];
          else revertedItems[productId] = currentQty;

          set({
            items: revertedItems,
            cartCount: getCartCount(revertedItems),
          });
          toast.error(
            error instanceof Error ? error.message : "Could not add to cart",
          );
        }
      },

      // PUT /api/cart/[id] - update specific item quantity
      updateQuantity: async (productId: string, quantity: number) => {
        if (!productId) {
          toast.error("Invalid product");
          return;
        }

        const currentItems = get().items;
        const prevQty = currentItems[productId] || 0;

        // Optimistic update
        const newItems = { ...currentItems };
        if (quantity <= 0) delete newItems[productId];
        else newItems[productId] = quantity;

        set({
          items: newItems,
          cartCount: getCartCount(newItems),
        });

        try {
          const response = await fetch(`/api/cart/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ quantity }),
          });

          if (response.status === 401) {
            // Revert optimistic update
            const revertedItems = { ...currentItems };
            if (prevQty === 0) delete revertedItems[productId];
            else revertedItems[productId] = prevQty;
            set({
              items: revertedItems,
              cartCount: getCartCount(revertedItems),
            });
            showLoginToast();
            return;
          }

          if (!response.ok) throw new Error("Failed to update cart");

          if (quantity === 0) toast.success("Item removed");
          else if (quantity < prevQty)
            toast.success(`Quantity decreased to ${quantity}`);
          else if (quantity > prevQty)
            toast.success(`Quantity increased to ${quantity}`);
        } catch (error) {
          // Revert optimistic update
          const revertedItems = { ...currentItems };
          if (prevQty === 0) delete revertedItems[productId];
          else revertedItems[productId] = prevQty;

          set({
            items: revertedItems,
            cartCount: getCartCount(revertedItems),
          });
          toast.error(
            error instanceof Error ? error.message : "Could not update cart",
          );
        }
      },

      // DELETE /api/cart/[id] - remove item (reuses updateQuantity with 0)
      removeItem: async (productId: string) => {
        await get().updateQuantity(productId, 0);
      },

      // DELETE /api/cart - clear entire cart
      clearCart: async () => {
        const prevItems = get().items;
        set({ items: {}, cartCount: 0 });

        try {
          const response = await fetch("/api/cart", {
            method: "DELETE",
            credentials: "include",
          });

          if (response.status === 401) {
            set({ items: prevItems, cartCount: getCartCount(prevItems) });
            showLoginToast();
            return;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to clear cart: ${errorText}`);
          }
          toast.success("Cart cleared");
        } catch (error) {
          set({
            items: prevItems,
            cartCount: getCartCount(prevItems),
          });
          toast.error(
            error instanceof Error ? error.message : "Failed to clear cart",
          );
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
