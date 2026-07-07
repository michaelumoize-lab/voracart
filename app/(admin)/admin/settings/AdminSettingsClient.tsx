// app/(admin)/admin/settings/AdminSettingsClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { SerializedSettings } from "@/lib/serialize";

interface AdminSettingsClientProps {
  initialSettings: SerializedSettings;
}

export default function AdminSettingsClient({
  initialSettings,
}: AdminSettingsClientProps) {
  const router = useRouter();
  const { settings, isLoading, error, setSettings, updateSettings } =
    useSettingsStore();

  // Hydrate store with server data on mount
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings, setSettings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Ensure settings is never null when updating
    const currentSettings = settings ?? ({} as SerializedSettings);
    setSettings({
      ...currentSettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) {
      toast.error("Settings not loaded");
      return;
    }

    try {
      await updateSettings(settings);
      toast.success("Settings updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update settings",
      );
    }
  };

  // Show loading/error states if needed (but we have initial data)
  if (!settings) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure global settings for your marketplace
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg p-6 space-y-6"
      >
        {/* General Settings */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Site Description
              </label>
              <input
                type="text"
                name="siteDescription"
                value={settings.siteDescription ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency & Limits */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Currency & Limits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Currency Code
              </label>
              <input
                type="text"
                name="currency"
                value={settings.currency ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                name="currencySymbol"
                value={settings.currencySymbol ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Max Order Amount (₦)
              </label>
              <input
                type="number"
                name="maxOrderAmount"
                value={settings.maxOrderAmount ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                required
                min="0"
                step="100"
              />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Shipping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Default Shipping Fee (₦)
              </label>
              <input
                type="number"
                name="shippingFee"
                value={settings.shippingFee ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                required
                min="0"
                step="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Free Shipping Threshold (₦)
                <span className="text-muted-foreground text-xs ml-1">
                  (leave blank to disable)
                </span>
              </label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                min="0"
                step="100"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Site Controls
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode ?? false}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
              />
              <span className="text-sm text-foreground">Maintenance Mode</span>
              <span className="text-xs text-muted-foreground">
                (blocks all user access except admin)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allowNewRegistrations"
                checked={settings.allowNewRegistrations ?? false}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
              />
              <span className="text-sm text-foreground">
                Allow New Registrations
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-border pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
