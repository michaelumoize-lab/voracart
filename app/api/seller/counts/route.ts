// app/api/seller/counts/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  // Check if user is a seller (or admin)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, store: { select: { id: true } } },
  });

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return apiError("Forbidden", 403);
  }

  try {
    // If admin, return counts for all stores? Or just 0?
    // For simplicity, if admin, we can return 0 for pendingOrders and totalProducts,
    // or we could compute them. Better to compute for the specific store.
    let pendingOrders = 0;
    let totalProducts = 0;

    if (user.store) {
      // Get pending orders for this seller's store
      pendingOrders = await prisma.orderItem.count({
        where: {
          storeId: user.store.id,
          status: "PENDING",
        },
      });

      // Get total products for this seller's store
      totalProducts = await prisma.product.count({
        where: {
          storeId: user.store.id,
          isActive: true,
        },
      });
    }

    return apiSuccess({ pendingOrders, totalProducts });
  } catch (error) {
    console.error("Error fetching seller counts:", error);
    return apiError("Failed to fetch counts", 500);
  }
}
