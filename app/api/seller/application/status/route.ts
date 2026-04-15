// app/api/seller/application/status/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const application = await prisma.sellerApplication.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    return apiSuccess({ application });
  } catch (error) {
    console.error("Failed to check application status:", error);
    return apiError("Failed to check status", 500);
  }
}