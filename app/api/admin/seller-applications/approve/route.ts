// app/api/admin/seller-applications/approve/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { z } from "zod";

const schema = z.object({
  applicationId: z.string(),
  adminNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  const body = await req.json();
  const { applicationId, adminNotes } = schema.parse(body);

  // Get the application with user
  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!application) return apiError("Application not found", 404);
  if (application.status !== "PENDING") {
    return apiError("Application is already processed", 400);
  }

  // Transaction: Approve application, create store, update user role
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update application
    const updatedApp = await tx.sellerApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        adminNotes,
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

    // 3. Update user role to seller
    await tx.user.update({
      where: { id: application.userId },
      data: { role: "seller" },
    });

    // 4. Create notification for the seller
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

  return apiSuccess(result);
}
