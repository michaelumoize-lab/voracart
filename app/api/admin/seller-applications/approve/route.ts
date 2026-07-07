// app/api/admin/seller-applications/approve/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const schema = z.object({
  applicationId: z.string(),
  adminNotes: z.string().optional(),
  action: z.enum(["approve", "reject"]),
});

/**
 * Generate a clean, URL‑friendly slug from a string.
 * - Lowercases
 * - Replaces non‑alphanumeric characters with hyphens
 * - Collapses multiple hyphens
 * - Trims leading/trailing hyphens
 * - Limits to 100 characters
 */
function generateBaseSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace non‑alphanumeric with hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .slice(0, 100); // prevent overly long slugs
}

/**
 * Ensure a slug is unique by appending a numeric suffix if needed.
 */
async function getUniqueSlug(baseSlug: string): Promise<string> {
  // If the base slug is empty, fallback to "store"
  const slugCandidate = baseSlug || "store";

  // Check if the slug already exists
  const existing = await prisma.store.findUnique({
    where: { slug: slugCandidate },
    select: { slug: true },
  });

  if (!existing) {
    return slugCandidate;
  }

  // Find the highest suffix number for this slug pattern
  const similarSlugs = await prisma.store.findMany({
    where: {
      slug: {
        startsWith: `${slugCandidate}-`,
      },
    },
    select: { slug: true },
  });

  // Extract numbers from existing slugs like "store-1", "store-2", etc.
  const suffixNumbers = similarSlugs
    .map((s) => {
      const parts = s.slug.split("-");
      const last = parts[parts.length - 1];
      const num = parseInt(last, 10);
      return isNaN(num) ? 0 : num;
    })
    .filter((n) => n > 0);

  // Determine the next available number
  const nextSuffix =
    suffixNumbers.length > 0 ? Math.max(...suffixNumbers) + 1 : 1;

  return `${slugCandidate}-${nextSuffix}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.message, 400);
  }

  const { applicationId, adminNotes, action } = parsed.data;

  // Fetch the application
  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!application) return apiError("Application not found", 404);
  if (application.status !== "PENDING") {
    return apiError("Application is already processed", 400);
  }

  try {
    // ─── REJECT ──────────────────────────────────────────────────────────────
    if (action === "reject") {
      const updatedApp = await prisma.sellerApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          adminNotes: adminNotes || null,
        },
      });

      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: "APPLICATION_REJECTED",
          message: `Your seller application for "${application.storeName}" was not approved.`,
          link: "/",
        },
      });

      return apiSuccess({ application: updatedApp, action: "rejected" });
    }

    // ─── APPROVE ─────────────────────────────────────────────────────────────

    // Prevent duplicate store creation
    const existingStore = await prisma.store.findUnique({
      where: { userId: application.userId },
    });
    if (existingStore) {
      return apiError("This user already has a store", 400);
    }

    // Generate a unique slug
    const baseSlug = generateBaseSlug(application.storeName);
    const uniqueSlug = await getUniqueSlug(baseSlug);

    // Transaction: approve, create store, update role, notify
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update application
      const updatedApp = await tx.sellerApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          adminNotes: adminNotes || null,
        },
      });

      // 2. Create store with the unique slug
      const store = await tx.store.create({
        data: {
          userId: application.userId,
          name: application.storeName,
          slug: uniqueSlug,
          description: application.description,
          phone: application.phone,
          rating: 0,
          totalSales: 0,
        },
      });

      // 3. Update user role
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "seller" },
      });

      // 4. Notify
      await tx.notification.create({
        data: {
          userId: application.userId,
          type: "APPLICATION_APPROVED",
          message: `Congratulations! Your seller application for "${application.storeName}" has been approved.`,
          link: "/seller",
        },
      });

      return { application: updatedApp, store };
    });

    return apiSuccess({ ...result, action: "approved" });
  } catch (error) {
    console.error("Error processing application:", error);

    // If a unique constraint error slips through (shouldn't happen with our check),
    // provide a clear message.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("Slug collision occurred. Please try again.", 409);
    }

    return apiError("Failed to process application", 500);
  }
}
