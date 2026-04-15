// app/api/seller/dashboard/stats/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can access this endpoint", 403);
  }

  try {
    const sellerProducts = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const productIds = sellerProducts.map(p => p.id);
    let totalOrders = 0, pendingOrders = 0, totalRevenue = 0, monthlyRevenue = 0;

    if (productIds.length > 0) {
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: productIds } },
        include: { order: true },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const uniqueOrders = new Set(orderItems.map(i => i.orderId));
      const uniquePending = new Set(orderItems.filter(i => i.order.status === "PENDING").map(i => i.orderId));
      
      totalOrders = uniqueOrders.size;
      pendingOrders = uniquePending.size;
      totalRevenue = orderItems.filter(i => i.order.status === "DELIVERED").reduce((s, i) => s + Number(i.price) * i.quantity, 0);
      monthlyRevenue = orderItems.filter(i => i.order.createdAt >= startOfMonth && i.order.status === "DELIVERED").reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    }

    const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      prisma.product.count({ where: { userId: session.user.id } }),
      prisma.product.count({ where: { userId: session.user.id, stock: { lt: 5, gt: 0 } } }),
      prisma.product.count({ where: { userId: session.user.id, stock: 0 } }),
    ]);

    return apiSuccess({
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        monthlyRevenue,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return apiError("Failed to fetch dashboard statistics", 500);
  }
}