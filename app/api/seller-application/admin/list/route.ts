// app/api/seller-application/admin/list/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const applications = await prisma.sellerApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return apiError("Failed to fetch applications", 500);
  }
}