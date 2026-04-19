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
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalOrders,
      pendingOrders,
      completedOrders,
      orderItems,
      monthlyOrderItems,
      pendingApplications,
      totalProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "seller" } }),
      prisma.user.count({ where: { role: "buyer" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.orderItem.findMany({
        where: { order: { status: "DELIVERED" } },
        select: { price: true, quantity: true },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: "DELIVERED",
            createdAt: { gte: monthStart },
          },
        },
        select: { price: true, quantity: true },
      }),
      prisma.sellerApplication.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
    ]);

    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const monthlyRevenue = monthlyOrderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const stats = {
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
    };

    return apiSuccess({ data: stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return apiError("Failed to fetch dashboard statistics", 500);
  }
}