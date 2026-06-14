// lib/use-session-client.ts
"use client";

import { useSession } from "@/lib/auth-client";

export function useClientSession() {
  const { data: session, isPending, error, refetch } = useSession();
  return {
    session,
    user: session?.user,
    isLoading: isPending,
    error,
    refetch,
    isAuthenticated: !!session,
  };
}
