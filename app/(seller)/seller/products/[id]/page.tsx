//app/(seller)/seller/products/[id]/page.tsx
// app/(seller)/seller/products/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { ProductCategory } from "@/lib/constants";
import { Loader2, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  offerPrice: number | null;
  stock: number;
  image: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { isSeller, isLoading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "Earphone",
    price: 0,
    offerPrice: null,
    stock: 0,
    image: "",
  });

  useEffect(() => {
    if (!roleLoading && !isSeller) {
      router.push("/");
    }
  }, [isSeller, roleLoading, router]);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      if (data.success) {
        const product = data.product;
        setFormData({
          name: product.name,
          description: product.description || "",
          category: product.category,
          price: Number(product.price),
          offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
          stock: product.stock || 0,
          image: typeof product.image === 'string' ? product.image : product.image[0],
        });
      } else {
        toast.error("Product not found");
        router.push("/seller/products");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Product updated successfully!");
        router.push("/seller/products");
      } else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted successfully!");
        router.push("/seller/products");
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Something went wrong");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "offerPrice" || name === "stock" 
        ? value === "" ? null : Number(value)
        : value,
    }));
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Update your product information</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-destructive border border-destructive rounded-lg hover:bg-destructive/10 transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Preview */}
        {formData.image && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product Image</label>
            <Image
              src={formData.image}
              alt={formData.name}
              width={120}
              height={120}
              className="rounded-lg object-cover border border-border"
            />
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Offer Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Offer Price (Optional)</label>
          <input
            type="number"
            name="offerPrice"
            value={formData.offerPrice || ""}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Stock Quantity</label>
          <input
            type="number"
            name="stock"
            value={formData.stock || ""}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}