// app/api/seller/orders/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can access this endpoint", 403);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
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

    // Filter items to only show seller's products (for non-admin)
    const filteredItems = session.user.role === "admin" 
      ? order.items 
      : order.items.filter((item) => item.product.userId === session.user.id);

    const formattedOrder = {
      id: order.id,
      customerName: order.user?.name || "Guest",
      customerEmail: session.user.role === "admin" ? order.user?.email : undefined,
      status: order.status,
      createdAt: order.createdAt,
      items: filteredItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: Number(item.price) * item.quantity,
        image: item.product.image,
        itemStatus: item.itemStatus,
      })),
      total: filteredItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    };

    return apiSuccess({ order: formattedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    return apiError("Failed to fetch order", 500);
  }
}

// PUT - Only admins can update overall order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  
  if (session.user.role !== "admin") {
    return apiError("Only admins can update overall order status", 403);
  }

  try {
    const { status } = await request.json();
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    if (!status || !validStatuses.includes(status)) {
      return apiError("Invalid status", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) return apiError("Order not found", 404);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return apiSuccess({ order: updatedOrder, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Error updating order:", error);
    return apiError("Failed to update order", 500);
  }
}

// PATCH - Sellers can update individual item status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can update item status", 403);
  }

  try {
    const { itemId, itemStatus } = await request.json();
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    if (!itemStatus || !validStatuses.includes(itemStatus)) {
      return apiError("Invalid status. Allowed: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED", 400);
    }

    // Get the order item with product info
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { product: true, order: true },
    });

    if (!orderItem) return apiError("Order item not found", 404);
    if (orderItem.orderId !== id) return apiError("Item does not belong to this order", 400);

    // Verify seller owns this product
    if (orderItem.product.userId !== session.user.id && session.user.role !== "admin") {
      return apiError("You don't have permission to update this item", 403);
    }

    // Update the order item status
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { itemStatus },
    });

    return apiSuccess({ 
      message: `Item status updated to ${itemStatus}`,
      item: updatedItem
    });
  } catch (error) {
    console.error("Error updating order item:", error);
    return apiError("Failed to update order item", 500);
  }
}