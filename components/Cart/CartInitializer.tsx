// components/CartInitializer.tsx
"use client";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export function CartInitializer() {
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return null;
}
