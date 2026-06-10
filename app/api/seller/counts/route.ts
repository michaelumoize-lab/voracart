// app/api/seller/counts/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return apiError("Unauthorized", 401);
  }

  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can access this endpoint", 403);
  }

  try {
    // Get seller's product IDs
    const sellerProducts = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const productIds = sellerProducts.map(p => p.id);

    let pendingOrders = 0;
    const totalProducts = sellerProducts.length;

    if (productIds.length > 0) {
      // Get unique pending orders containing seller's products
      const orderItems = await prisma.orderItem.findMany({
        where: {
          productId: { in: productIds },
          order: { status: "PENDING" },
        },
        select: { orderId: true },
      });
      
      const uniqueOrderIds = new Set(orderItems.map(item => item.orderId));
      pendingOrders = uniqueOrderIds.size;
    }

    return apiSuccess({
      pendingOrders,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching seller counts:", error);
    return apiError("Failed to fetch counts", 500);
  }
}