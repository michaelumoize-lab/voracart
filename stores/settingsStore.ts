// stores/settingsStore.ts
import { create } from "zustand";
import type { SerializedSettings } from "@/lib/serialize";

interface SettingsState {
  settings: SerializedSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<SerializedSettings>) => Promise<void>;
  setSettings: (settings: SerializedSettings) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  setSettings: (settings) => set({ settings, error: null }),

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch settings");
      }
      const data = await res.json();
      set({ settings: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Merge current settings with updates
      const current = get().settings;
      if (!current) throw new Error("No settings loaded");

      const payload = { ...current, ...data };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      const updated = await res.json();
      set({ settings: updated, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
      throw error;
    }
  },

  reset: () => set({ settings: null, isLoading: false, error: null }),
}));
