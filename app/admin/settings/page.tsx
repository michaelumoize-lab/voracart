// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SystemSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!settings) return <div>Failed to load settings</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleChange("siteName", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Site Description</label>
          <textarea
            value={settings.siteDescription || ""}
            onChange={(e) => handleChange("siteDescription", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact Phone</label>
          <input
            type="tel"
            value={settings.contactPhone || ""}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
          />
          <label>Maintenance Mode</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.allowNewRegistrations}
            onChange={(e) =>
              handleChange("allowNewRegistrations", e.target.checked)
            }
          />
          <label>Allow New Registrations</label>
        </div>
        <div>
          <label className="block text-sm font-medium">
            Max Order Amount (₦)
          </label>
          <input
            type="number"
            value={settings.maxOrderAmount}
            onChange={(e) =>
              handleChange("maxOrderAmount", Number(e.target.value))
            }
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Currency Code</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol}
              onChange={(e) => handleChange("currencySymbol", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Shipping Fee (₦)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.shippingFee}
              onChange={(e) =>
                handleChange("shippingFee", Number(e.target.value))
              }
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Free Shipping Threshold (₦)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.freeShippingThreshold ?? ""}
              onChange={(e) =>
                handleChange(
                  "freeShippingThreshold",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
