// app/api/admin/applications/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { createNotification } from "@/lib/notifications";

// GET - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  try {
    const application = await prisma.sellerApplication.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!application) {
      return apiError("Application not found", 404);
    }

    return apiSuccess({ application });
  } catch (error) {
    console.error("Error fetching application:", error);
    return apiError("Failed to fetch application", 500);
  }
}

// PUT - Approve or reject application
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  try {
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return apiError("Invalid status. Must be APPROVED or REJECTED", 400);
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!application) {
      return apiError("Application not found", 404);
    }

    // Update application
    const updatedApplication = await prisma.sellerApplication.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // If approved, update user role to seller
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "seller" },
      });

      // Use createNotification helper
      await createNotification({
        userId: application.userId,
        type: "APPLICATION_APPROVED",
        message: `Congratulations! Your seller application for "${application.storeName}" has been approved.`,
        link: "/seller/dashboard",
      });
    } else {
      // Use createNotification helper
      await createNotification({
        userId: application.userId,
        type: "APPLICATION_REJECTED",
        message: adminNotes 
          ? `Your seller application was rejected. Reason: ${adminNotes}`
          : "Your seller application has been rejected. Please contact support.",
        link: "/seller/apply",
      });
    }

    return apiSuccess({
      application: updatedApplication,
      message: `Application ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return apiError("Failed to update application", 500);
  }
}

// DELETE - Delete application (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  try {
    const application = await prisma.sellerApplication.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return apiError("Application not found", 404);
    }

    await prisma.sellerApplication.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return apiError("Failed to delete application", 500);
  }
}