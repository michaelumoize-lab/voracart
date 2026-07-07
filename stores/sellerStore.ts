// stores/sellerStore.ts
import { create } from "zustand";

interface SellerStore {
  pendingOrders: number;
  totalProducts: number;
  isLoading: boolean;
  fetchSellerCounts: () => Promise<void>;
}

export const useSellerStore = create<SellerStore>((set) => ({
  pendingOrders: 0,
  totalProducts: 0,
  isLoading: false,
  fetchSellerCounts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/seller/counts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.success) {
        set({
          pendingOrders: data.pendingOrders,
          totalProducts: data.totalProducts,
        });
      }
    } catch (error) {
      console.error("Error fetching seller counts:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
