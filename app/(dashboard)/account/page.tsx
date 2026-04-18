// app/(dashboard)/account/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useClientSession } from "@/lib/use-session-client";
import { User, Mail, Phone, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { session } = useClientSession();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    whatsappNumber: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          whatsappNumber: userData.whatsappNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Account Settings
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <User className="w-4 h-4" /> Full Name
          </label>
          <input
            type="text"
            value={userData.name || ""}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </label>
          <input
            type="email"
            value={userData.email || ""}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4" /> WhatsApp Number
          </label>
          <input
            type="tel"
            value={userData.whatsappNumber || ""}
            onChange={(e) =>
              setUserData({ ...userData, whatsappNumber: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for order communication
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Account Type
          </label>
          <input
            type="text"
            value={userData.role || "buyer"}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-muted-foreground capitalize"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
