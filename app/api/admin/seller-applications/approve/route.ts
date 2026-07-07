// app/api/admin/seller-applications/approve/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { z } from "zod";

const schema = z.object({
  applicationId: z.string(),
  adminNotes: z.string().optional(),
  action: z.enum(["approve", "reject"]), // ✅ required
});

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

      // Notify the applicant
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

    // Prevent duplicate store creation (user might already be a seller)
    const existingStore = await prisma.store.findUnique({
      where: { userId: application.userId },
    });
    if (existingStore) {
      return apiError("This user already has a store", 400);
    }

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

      // 2. Create store
      const store = await tx.store.create({
        data: {
          userId: application.userId,
          name: application.storeName,
          slug: application.storeName.toLowerCase().replace(/\s+/g, "-"),
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
    return apiError("Failed to process application", 500);
  }
}
