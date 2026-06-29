// app/api/admin/counts/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Forbidden", 403);

  try {
    const pendingApplications = await prisma.sellerApplication.count({
      where: { status: "PENDING" },
    });

    return apiSuccess({ pendingApplications });
  } catch (error) {
    console.error("Error fetching admin counts:", error);
    return apiError("Failed to fetch counts", 500);
  }
}
