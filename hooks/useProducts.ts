// hooks/useProducts.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Product } from "@/types";

interface UseProductsOptions {
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  total?: number;
  message?: string;
}

export function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const { limit, category, search, sortBy, minPrice, maxPrice } = options ?? {};

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s safety net

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit.toString());
        if (category && category !== "all") params.append("category", category);
        if (search) params.append("search", search);
        if (sortBy) params.append("sortBy", sortBy);
        if (minPrice) params.append("minPrice", minPrice.toString());
        if (maxPrice) params.append("maxPrice", maxPrice.toString());

        const url = params.toString()
          ? `/api/products?${params.toString()}`
          : "/api/products";

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data: ProductsResponse = await res.json();

        if (data.success) {
          setProducts(data.products);
          setTotal(data.total ?? data.products.length);
        } else {
          setError(data.message || "Failed to load products");
          toast.error(data.message || "Failed to load products");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError("Request timed out");
          toast.error("Taking too long to load products");
          return;
        }
        console.error("Error fetching products:", err);
        setError("Network error");
        toast.error("Failed to load products");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        } else {
          setLoading(false); // still clear it on timeout so the UI doesn't hang
        }
      }
    }

    fetchProducts();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [limit, category, search, sortBy, minPrice, maxPrice, refetchIndex]);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  return { products, loading, error, total, refetch };
}
