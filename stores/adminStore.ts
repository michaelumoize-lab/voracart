// stores/adminStore.ts
import { create } from "zustand";

interface AdminStore {
  pendingApplications: number;
  isLoading: boolean;
  fetchPendingApplications: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  pendingApplications: 0,
  isLoading: false,
  fetchPendingApplications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/admin/counts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.success) {
        set({ pendingApplications: data.pendingApplications });
      }
    } catch (error) {
      console.error("Error fetching admin counts:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
