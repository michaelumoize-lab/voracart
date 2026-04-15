// app/api/admin/dashboard/stats/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  try {
    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      pendingApplications,
      totalProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "seller" } }),
      prisma.user.count({ where: { role: "buyer" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.orderItem.aggregate({
        where: { order: { status: "DELIVERED" } },
        _sum: { price: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            status: "DELIVERED",
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        },
        _sum: { price: true },
      }),
      prisma.sellerApplication.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
    ]);

    const stats = {
      totalUsers,
      totalSellers,
      totalBuyers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.price || 0,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      pendingApplications,
      totalProducts,
    };

    return apiSuccess({ data: stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return apiError("Failed to fetch dashboard statistics", 500);
  }
}