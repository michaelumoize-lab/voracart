// app/api/orders/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  storeId: z.string().min(1),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  subtotal: z.number().nonnegative(),
  shippingFee: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
  shippingAddressId: z.string().min(1),
  paymentMethod: z.string().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return apiError("Unauthorized", 401);
  }

  const validation = await validateBody(request, createOrderSchema);
  if (validation.error) return validation.error;

  const {
    items,
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    shippingAddressId,
    paymentMethod,
    notes,
  } = validation.data;

  try {
    // Verify shipping address belongs to user
    const shippingAddress = await prisma.shippingAddress.findFirst({
      where: {
        id: shippingAddressId,
        userId: session.user.id,
      },
    });

    if (!shippingAddress) {
      return apiError("Invalid shipping address", 400);
    }

    // Verify all products exist and are active
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        storeId: true,
        stock: true,
      },
    });

    if (products.length !== items.length) {
      return apiError("One or more products are invalid or inactive", 400);
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return apiError(
          `Insufficient stock for product ${item.productId}`,
          400,
        );
      }
    }

    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          shippingAddressId,
          status: "PENDING",
          subtotal,
          shippingFee,
          discountAmount,
          totalAmount,
          paymentMethod: paymentMethod || null,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.unitPrice * item.quantity,
              storeId: item.storeId,
              status: "PENDING",
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Clear user's cart items
      await tx.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId: { in: productIds },
        },
      });

      return newOrder;
    });

    // Trigger background jobs (notifications, emails, etc.)
    // You can add Inngest or similar here

    return apiSuccess(
      {
        order: {
          id: order.id,
          status: order.status,
          totalAmount: Number(order.totalAmount),
        },
        message: "Order created successfully",
      },
      201,
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return apiError("Failed to create order", 500);
  }
}
