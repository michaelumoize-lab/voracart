// app/api/orders/route.ts
import { NextRequest } from "next/server";
import { ItemStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  storeId: z.string().min(1),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  shippingFee: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
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
    shippingFee,
    discountAmount,
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
    const uniqueProductIds = [...new Set(productIds)];
    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        storeId: true,
        stock: true,
      },
    });

    if (products.length !== uniqueProductIds.length) {
      return apiError("One or more products are invalid or inactive", 400);
    }
    // Aggregate quantities by product and check stock
    const productQuantities = new Map<string, number>();
    for (const item of items) {
      const current = productQuantities.get(item.productId) || 0;
      productQuantities.set(item.productId, current + item.quantity);
    }

    for (const [productId, totalQty] of productQuantities) {
      const product = products.find((p) => p.id === productId);
      if (!product || product.stock < totalQty) {
        return apiError(`Insufficient stock for product ${productId}`, 400);
      }
    }

    // Build order pricing from trusted product data
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const unitPrice = Number(product.price);
      const total = unitPrice * item.quantity;

      return {
        quantity: item.quantity,
        unitPrice,
        total,
        storeId: item.storeId,
        status: ItemStatus.PENDING,
        product: {
          connect: { id: item.productId },
        },
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal + Number(shippingFee) - Number(discountAmount);

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
            create: orderItems,
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
