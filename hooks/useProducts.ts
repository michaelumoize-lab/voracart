"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Product } from "@/types";

export function useProducts(limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const url = limit ? `/api/products?limit=${limit}` : "/api/products";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      const data = await res.json();      
      if (data.success) {
        setProducts(data.products);
        setError(null);
      } else {
        setError(data.message || "Failed to load products");
        toast.error(data.message || "Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Network error");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts();
  }, [limit, fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}