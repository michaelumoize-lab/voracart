// lib/helpers.server.ts
import { cache } from "react";
import { auth } from "./auth";
import { getServerSession } from "./get-session";

// ============ SERVER-SIDE HELPERS ============

/**
 * Get current user with full type safety
 */
export const getCurrentUser = cache(async () => {
  const session = await getServerSession();
  return session?.user || null;
});

/**
 * Check if user is authenticated (any role)
 */
export const isAuthenticated = cache(async (): Promise<boolean> => {
  const session = await getServerSession();
  return !!session?.user;
});

/**
 * Role checkers (Server)
 */
export const isSeller = cache(async (): Promise<boolean> => {
  const session = await getServerSession();
  return session?.user?.role === "seller";
});

export const isAdmin = cache(async (): Promise<boolean> => {
  const session = await getServerSession();
  return session?.user?.role === "admin";
});

export const isBuyer = cache(async (): Promise<boolean> => {
  const session = await getServerSession();
  if (!session?.user) return false;
  return !session.user.role || session.user.role === "buyer";
});
/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = cache(async (roles: string[]): Promise<boolean> => {
  const session = await getServerSession();
  const userRole = session?.user?.role;
  return userRole ? roles.includes(userRole) : false;
});

/**
 * Get user's role
 */
export const getUserRole = cache(async (): Promise<string | null> => {
  const session = await getServerSession();
  return session?.user?.role || null;
});

/**
 * Protect route - redirects if condition fails (use in server components)
 */
export const protectRoute = async (
  condition: boolean | Promise<boolean>,
  redirectTo: string = "/auth/sign-in"
): Promise<void> => {
  const isAllowed = await condition;
  if (!isAllowed) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }
};

/**
 * Get session with role included in type
 */
export const getSessionWithRole = cache(async () => {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: session.user?.role as "buyer" | "seller" | "admin" | undefined,
    },
  };
});

// ============ API ROUTE HELPERS ============

/**
 * Get session from API route (for Route Handlers)
 */
export const getApiSession = async (request: Request) => {
  const headersObj = new Headers(request.headers);
  return await auth.api.getSession({ headers: headersObj });
};

/**
 * Verify API request authentication
 */
export const verifyApiAuth = async (request: Request, requiredRole?: string) => {
  const session = await getApiSession(request);
  
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }
  
  if (requiredRole && session.user.role !== requiredRole) {
    return { error: "Forbidden", status: 403 };
  }
  
  return { session, error: null, status: 200 };
};

// ============ DATABASE HELPERS ============

/**
 * Get user by ID with role
 */
export const getUserById = cache(async (userId: string) => {
  const { prisma } = await import("@/lib/prisma");
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
});

/**
 * Update user role (caller must enforce admin authorization)
 */
export const updateUserRole = async (userId: string, role: "buyer" | "seller" | "admin") => {
  const { prisma } = await import("@/lib/prisma");
  return await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
};

// ============ SELLER APPLICATION HELPERS ============

/**
 * Check if user has pending seller application
 */
export const hasPendingSellerApplication = cache(async (userId: string) => {
  const { prisma } = await import("@/lib/prisma");
  const application = await prisma.sellerApplication.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
  });
  return !!application;
});

/**
 * Get seller application status
 */
export const getSellerApplicationStatus = cache(async (userId: string) => {
  const { prisma } = await import("@/lib/prisma");
  const application = await prisma.sellerApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return application?.status || null;
});