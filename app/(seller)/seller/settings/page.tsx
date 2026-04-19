// app/(seller)/seller/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import { Save, Store, Phone, Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SellerSettings {
  storeName: string;
  whatsappNumber: string;
  storeDescription: string;
}

export default function SellerSettings() {
  const router = useRouter();
  const { isSeller, isLoading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SellerSettings>({
    storeName: "",
    whatsappNumber: "",
    storeDescription: "",
  });

  useEffect(() => {
    if (!roleLoading && !isSeller) {
      router.push("/");
    }
  }, [isSeller, roleLoading, router]);

  useEffect(() => {
    if (!roleLoading && isSeller) {
      fetchSettings();
    }
  }, [roleLoading, isSeller]);
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/seller/settings");
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setSettings({
          storeName: data.data.storeName || "",
          whatsappNumber: data.data.whatsappNumber || "",
          storeDescription: data.data.storeDescription || "",
        });
      } else {
        toast.error(data.message || "Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update settings");
        return;
      }

      if (data.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Store Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your store information and contact details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Name */}
        <div>
          <label
            htmlFor="storeName"
            className="block text-sm font-medium text-foreground mb-2"
          >
            <Store className="inline w-4 h-4 mr-2" />
            Store Name
          </label>
          <input
            id="storeName"
            type="text"
            name="storeName"
            value={settings.storeName}
            onChange={handleChange}
            required
            placeholder="Your store name"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This name will be shown to customers on your products
          </p>
        </div>

        {/* WhatsApp Number */}
        <div>
          <label
            htmlFor="whatsappNumber"
            className="block text-sm font-medium text-foreground mb-2"
          >
            <Phone className="inline w-4 h-4 mr-2" />
            WhatsApp Number
          </label>
          <input
            id="whatsappNumber"
            type="tel"
            name="whatsappNumber"
            value={settings.whatsappNumber}
            onChange={handleChange}
            required
            placeholder="+1234567890"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Customers will contact you on this WhatsApp number for orders
          </p>
        </div>

        {/* Store Description */}
        <div>
          <label
            htmlFor="storeDescription"
            className="block text-sm font-medium text-foreground mb-2"
          >
            <Info className="inline w-4 h-4 mr-2" />
            Store Description
          </label>
          <textarea
            id="storeDescription"
            name="storeDescription"
            value={settings.storeDescription}
            onChange={handleChange}
            rows={4}
            placeholder="Tell customers about your store..."
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A brief description of your store (optional)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
