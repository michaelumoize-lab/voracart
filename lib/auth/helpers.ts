// lib/auth/helpers.ts
"use client";

import { useSession } from "@/lib/auth-client";

export function useRole() {
  const { data: session, isPending } = useSession();
  
  return {
    session,
    user: session?.user,
    role: session?.user?.role as "buyer" | "seller" | "admin" | undefined,
    isLoading: isPending,
    isAuthenticated: !!session,
    isSeller: session?.user?.role === "seller",
    isAdmin: session?.user?.role === "admin",
    isBuyer: !!session && (!session.user?.role || session.user.role === "buyer"),  };
}