// app/api/seller/orders/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can access this endpoint", 403);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!order) return apiError("Order not found", 404);

    // Verify seller owns at least one product in this order
    const hasSellerProduct = order.items.some(
      (item) => item.product.userId === session.user.id
    );
    if (!hasSellerProduct && session.user.role !== "admin") {
      return apiError("You don't have permission to view this order", 403);
    }

    const formattedOrder = {
      id: order.id,
      customerName: order.user?.name || "Guest",
      customerEmail: order.user?.email,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: Number(item.price) * item.quantity,
        image: item.product.image,
      })),
      total: order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    };

    return apiSuccess({ order: formattedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    return apiError("Failed to fetch order", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can update orders", 403);
  }

  try {
    const { status } = await request.json();
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    if (!status || !validStatuses.includes(status)) {
      return apiError("Invalid status", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) return apiError("Order not found", 404);

    const hasSellerProduct = order.items.some(
      (item) => item.product.userId === session.user.id
    );
    if (!hasSellerProduct && session.user.role !== "admin") {
      return apiError("You don't have permission to update this order", 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return apiSuccess({ order: updatedOrder, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Error updating order:", error);
    return apiError("Failed to update order", 500);
  }
}