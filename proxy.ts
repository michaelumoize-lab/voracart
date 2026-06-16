import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/my-orders",
  "/checkout",
  "/wishlist",
  "/profile",
  "/my-addresses",
  "/cart",
] as const;

const ADMIN_ROUTES = ["/admin"] as const;

const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"] as const;

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  // Cache session so we only fetch it once per request
  let sessionCache:
    | Awaited<ReturnType<typeof auth.api.getSession>>
    | null
    | undefined;

  const getSession = async () => {
    if (sessionCache === undefined) {
      sessionCache = await auth.api.getSession({
        headers: request.headers,
      });
    }
    return sessionCache;
  };

  // Handle Better Auth error endpoint
  if (pathname === "/api/auth/error") {
    const redirectUrl = new URL("/auth/error", request.url);

    const error = nextUrl.searchParams.get("error");
    const description = nextUrl.searchParams.get("error_description");

    if (error) {
      redirectUrl.searchParams.set("error", error);
    }

    if (description) {
      redirectUrl.searchParams.set("error_description", description);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    const session = await getSession();

    if (session) {
      const redirectParam = nextUrl.searchParams.get("redirect") || "/";
      // Only allow relative paths, reject external URLs
      const redirectTo =
        redirectParam.startsWith("/") && !redirectParam.startsWith("//")
          ? redirectParam
          : "/";

      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.next();
  }
  // Admin routes
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    const session = await getSession();

    if (!session) {
      const redirectUrl = new URL("/auth/sign-in", request.url);

      redirectUrl.searchParams.set("redirect", pathname + search);

      return NextResponse.redirect(redirectUrl);
    }

    const userRole = session.user.role;

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // Protected routes
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    const session = await getSession();

    if (!session) {
      const redirectUrl = new URL("/auth/sign-in", request.url);

      redirectUrl.searchParams.set("redirect", pathname + search);

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",

    "/dashboard/:path*",
    "/my-orders/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/profile/:path*",
    "/my-addresses/:path*",
    "/cart",

    "/auth/sign-in",
    "/auth/sign-up",

    "/api/auth/error",
  ],
};
