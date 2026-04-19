"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { ProductCategory } from "@/lib/constants";

export default function AddProductForm() {
  const router = useRouter();
  const [files, setFiles] = useState<(File | undefined)[]>([]);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Earphone");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // Clean up blob URLs when component unmounts or files change
  useEffect(() => {
    // Revoke previous URLs when component unmounts
    return () => {
      imageUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const handleFileChange =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const newFile = e.target.files?.[0];

      // Revoke previous URL for this index if it exists
      if (imageUrls[index]) {
        URL.revokeObjectURL(imageUrls[index] as string);
      }

      // Update files array
      const updatedFiles = [...files];
      updatedFiles[index] = newFile;
      setFiles(updatedFiles);

      // Update image URLs array
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = newFile ? URL.createObjectURL(newFile) : null;
      setImageUrls(updatedUrls);
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageFiles = files.filter(Boolean) as File[];

      if (imageFiles.length === 0) {
        toast.error("Please add at least one product image");
        setLoading(false);
        return;
      }

      const numericPrice = Number(price);
      const numericOfferPrice =
        offerPrice !== "" ? Number(offerPrice) : undefined;

      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        toast.error("Please enter a valid price greater than zero");
        setLoading(false);
        return;
      }

      if (numericOfferPrice !== undefined) {
        if (!Number.isFinite(numericOfferPrice) || numericOfferPrice <= 0) {
          toast.error("Please enter a valid offer price");
          setLoading(false);
          return;
        }

        if (numericOfferPrice >= numericPrice) {
          toast.error("Offer price must be less than the regular price");
          setLoading(false);
          return;
        }
      }

      // Upload images
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append("images", file));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        toast.error("Image upload failed");
        setLoading(false);
        return;
      }

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        toast.error(uploadData.message || "Image upload failed");
        setLoading(false);
        return;
      }

      // Create product - Using RESTful endpoint
      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          price: numericPrice,
          offerPrice: numericOfferPrice,
          image: uploadData.urls,
        }),
      });

      if (!productRes.ok) {
        toast.error("Failed to add product");
        setLoading(false);
        return;
      }

      const productData = await productRes.json();

      if (!productData.success) {
        toast.error(productData.message || "Failed to add product");
        setLoading(false);
        return;
      }

      toast.success("Product added successfully!");
      router.refresh();

      // Clean up URLs before resetting
      imageUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });

      // Reset form
      setFiles([]);
      setImageUrls([]);
      setName("");
      setDescription("");
      setCategory("Earphone");
      setPrice("");
      setOfferPrice("");

      // Optional: Redirect to seller products page
      // router.push("/seller/products");
    } catch (error) {
      console.error("Add product error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
      {/* Images */}
      <div>
        <p className="text-base font-medium">Product Image</p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {[...Array(4)].map((_, index) => (
            <label key={index} htmlFor={`image${index}`}>
              <input
                type="file"
                id={`image${index}`}
                accept="image/*"
                hidden
                onChange={handleFileChange(index)}
              />
              <Image
                src={imageUrls[index] || assets.upload_area}
                alt="upload"
                width={100}
                height={100}
                className="max-w-24 cursor-pointer rounded border"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product name"
        className="border p-2 w-full rounded"
        required
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 w-full rounded"
        rows={4}
        required
      />

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ProductCategory)}
        className="border p-2 w-full rounded"
        required
      >
        {PRODUCT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Price */}
      <input
        type="number"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="border p-2 w-full rounded"
        required
      />

      {/* Offer Price */}
      <input
        type="number"
        step="0.01"
        value={offerPrice}
        onChange={(e) => setOfferPrice(e.target.value)}
        placeholder="Offer Price (optional)"
        className="border p-2 w-full rounded"
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "ADD PRODUCT"}
      </button>
    </form>
  );
}
