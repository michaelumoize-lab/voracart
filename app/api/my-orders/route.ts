// app/api/my-orders/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
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
        shippingAddress: {
          select: {
            fullName: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => ({
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
    }));

    return apiSuccess({
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return apiError("Failed to fetch orders", 500);
  }
}
