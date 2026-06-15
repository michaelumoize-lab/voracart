// app/api/my-orders/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: session.user.id, // Ensure user owns this order
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        totalAmount: true,
        subtotal: true,
        shippingFee: true,
        discountAmount: true,
        paymentMethod: true,
        paymentReference: true,
        notes: true,
        invoiceUrl: true,
        emailSent: true,
        notificationSent: true,
        metadata: true,
        shippingAddress: {
          select: {
            fullName: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return apiError("Order not found", 404);
    }

    const formattedOrder = {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: Number(order.totalAmount),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: Number(order.discountAmount),
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      notes: order.notes,
      invoiceUrl: order.invoiceUrl,
      emailSent: order.emailSent,
      notificationSent: order.notificationSent,
      metadata: order.metadata,
      shippingAddress: order.shippingAddress
        ? {
            fullName: order.shippingAddress.fullName,
            address: order.shippingAddress.address,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            pincode: order.shippingAddress.pincode,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        status: item.status,
      })),
    };

    return apiSuccess({ order: formattedOrder });
  } catch (error) {
    console.error("Fetch order error:", error);
    return apiError("Failed to fetch order", 500);
  }
}
