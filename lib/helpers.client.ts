"use client";

import { authClient } from "./auth-client";

export function useRole() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  return {
    session,
    user: session?.user,
    role: session?.user?.role as "buyer" | "seller" | "admin" | undefined,
    isAuthenticated: !!session,
    isSeller: session?.user?.role === "seller",
    isAdmin: session?.user?.role === "admin",
    isBuyer: !!session?.user && (!session.user.role || session.user.role === "buyer"),    isLoading: isPending,
    error,
    refetch,
  };
}

export const logout = async (redirectTo?: string) => {
  await authClient.signOut();
  if (redirectTo) {
    window.location.href = redirectTo;
  }
};
