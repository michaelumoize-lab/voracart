// app/api/seller-application/apply/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { notifyAdminsOfNewApplication } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  // Check if user is already a seller
  if (session.user.role === "seller") {
    return apiError("You are already a seller", 400);
  }

  // Check if user already has a pending application
  const existingApplication = await prisma.sellerApplication.findUnique({
    where: { userId: session.user.id },
  });

  if (existingApplication) {
    if (existingApplication.status === "PENDING") {
      return apiError("You already have a pending application", 400);
    }
    if (existingApplication.status === "APPROVED") {
      return apiError("Your application has already been approved", 400);
    }
  }

  try {
    const body = await request.json();
    const { storeName, phone, description } = body;

    if (!storeName || !phone) {
      return apiError("Store name and phone number are required", 400);
    }

    const application = await prisma.sellerApplication.upsert({
      where: { userId: session.user.id },
      update: {
        storeName,
        phone,
        description,
        status: "PENDING",
      },
      create: {
        userId: session.user.id,
        storeName,
        phone,
        description,
        status: "PENDING",
      },
    });

    // Notify admins
    await notifyAdminsOfNewApplication(session.user.name || session.user.email, application.id);

    return apiSuccess({ application }, 201);
  } catch (error) {
    console.error("Error creating application:", error);
    return apiError("Failed to submit application", 500);
  }
}