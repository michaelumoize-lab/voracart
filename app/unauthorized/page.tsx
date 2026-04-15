// app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home, Lock } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Unauthorized Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <div className="relative">
            <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-2">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          This area requires special privileges. If you believe this is an error,
          please contact an administrator.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-accent transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Role info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Need access?{" "}
            <Link href="/become-seller" className="text-primary hover:underline">
              Apply to become a seller
            </Link>
            {" "}or{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}