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
        throw new Error(errorData.message || "Failed to fetch settings");
      }
      const data = await res.json();
      // ✅ Unwrap the envelope
      if (data.success && data.settings) {
        set({ settings: data.settings, isLoading: false });
      } else {
        throw new Error("Invalid response format from settings API");
      }
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
        throw new Error(errorData.message || "Failed to update settings");
      }

      const updated = await res.json();
      // ✅ Unwrap the envelope
      if (updated.success && updated.settings) {
        set({ settings: updated.settings, isLoading: false });
      } else {
        throw new Error("Invalid response format from settings update");
      }
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
