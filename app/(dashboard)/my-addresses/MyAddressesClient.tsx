// app/(dashboard)/my-addresses/MyAddressesClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import type { SerializedAddress } from "@/lib/serialize";

// Define schema
const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Use z.infer for the type
type AddressFormValues = z.infer<typeof addressSchema>;

interface MyAddressesClientProps {
  initialAddresses: SerializedAddress[];
}

export default function MyAddressesClient({
  initialAddresses,
}: MyAddressesClientProps) {
  const router = useRouter();
  const [addresses, setAddresses] =
    useState<SerializedAddress[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    },
  });

  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    setSaving(true);
    try {
      const res = await fetch("/api/shipping-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      const newAddress = result.address;
      setAddresses((prev) =>
        data.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
          : [...prev, newAddress],
      );
      setShowForm(false);
      reset();
      toast.success("Address saved");
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/shipping-addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error();
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update default");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/shipping-addresses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      const removed = addresses.find((a) => a.id === id);
      let updated = addresses.filter((a) => a.id !== id);
      if (removed?.isDefault && updated.length > 0) {
        updated = updated.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      setAddresses(updated);
      toast.success("Address deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-lg p-5 space-y-3"
        >
          <h3 className="font-medium text-foreground">New Address</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Full Name *
            </label>
            <input
              {...register("fullName")}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Phone *
            </label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.phone && (
              <p className="text-xs text-destructive mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Address *
            </label>
            <input
              {...register("address")}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.address && (
              <p className="text-xs text-destructive mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                City
              </label>
              <input
                {...register("city")}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                State
              </label>
              <input
                {...register("state")}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Pincode
            </label>
            <input
              {...register("pincode")}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="accent-primary"
            />
            Set as default
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No saved addresses yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-card border rounded-lg p-4 flex gap-3 ${
                    addr.isDefault ? "border-primary" : "border-border"
                  }`}
                >
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-foreground text-sm">
                        {addr.fullName}
                      </p>
                      {addr.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {addr.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[addr.address, addr.city, addr.state, addr.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        title="Set as default"
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === addr.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
