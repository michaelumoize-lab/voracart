// app/api/cart/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// DELETE - Remove a specific product from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id: productId } = await params;

  try {
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return apiSuccess({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return apiError("Failed to remove item", 500);
  }
}

// Optional: PUT to update quantity of a specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id: productId } = await params;

  let body: { quantity: number };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { quantity } = body;
  if (
    typeof quantity !== "number" ||
    quantity < 0 ||
    !Number.isInteger(quantity)
  ) {
    return apiError("Quantity must be a non-negative integer", 400);
  }
  // Check product exists and stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });
  if (!product) return apiError("Product not found", 404);
  if (quantity > product.stock) {
    return apiError(`Only ${product.stock} items available`, 400);
  }

  try {
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
      });
    } else {
      await prisma.cartItem.upsert({
        where: {
          userId_productId: { userId: session.user.id, productId },
        },
        update: { quantity },
        create: { userId: session.user.id, productId, quantity },
      });
    }
    return apiSuccess({ message: "Cart updated" });
  } catch (error) {
    console.error("Update cart item error:", error);
    return apiError("Failed to update cart", 500);
  }
}
