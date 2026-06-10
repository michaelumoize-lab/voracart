// app/api/seller/orders/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can access this endpoint", 403);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  try {
    // Get seller's product IDs
    const sellerProducts = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const productIds = sellerProducts.map(p => p.id);

    if (productIds.length === 0) {
      return apiSuccess({ orders: [], pagination: { page, limit, total: 0, pages: 0 } });
    }

    // Build where clause with proper typing
    const where: Prisma.OrderWhereInput = {
      items: {
        some: {
          productId: { in: productIds },
        },
      },
    };
    
    if (status) {
      where.status = status;
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } }, // ✅ Removed email - PII protection
          items: {
            include: { product: { select: { id: true, name: true, image: true, price: true } } },
            where: { productId: { in: productIds } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customerName: order.user?.name || "Guest",
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.image,
      })),
    }));

    return apiSuccess({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return apiError("Failed to fetch orders", 500);
  }
}