// app/api/cart/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { updateCartSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// GET - Fetch current user's cart with product details
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            offerPrice: true,
            images: { take: 1, select: { url: true } },
            stock: true,
          },
        },
      },
    });

    // Transform to a simple { productId: quantity } object
    const cartMap = cartItems.reduce(
      (acc, item) => {
        acc[item.productId] = item.quantity;
        return acc;
      },
      {} as Record<string, number>,
    );

    return apiSuccess({ cart: cartMap, items: cartItems });
  } catch (error) {
    console.error("Fetch cart error:", error);
    return apiError("Failed to fetch cart", 500);
  }
}

// POST - Add or update a product in the cart (upsert)
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = updateCartSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return apiError(message, 400);
  }

  const { productId, quantity } = parsed.data;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true },
  });

  if (!product) {
    return apiError(`Product with ID ${productId} not found`, 404);
  }

  // Optional: prevent adding more than stock
  if (quantity > product.stock) {
    return apiError(`Only ${product.stock} items available`, 400);
  }

  try {
    if (quantity === 0) {
      // Remove item if quantity is 0
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
      });
      return apiSuccess({ message: "Item removed from cart" });
    }

    // Upsert (insert or update)
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: { quantity },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
    });

    return apiSuccess({ message: "Cart updated" });
  } catch (err) {
    console.error("Cart update error:", err);
    return apiError("Failed to update cart", 500);
  }
}

// DELETE - Clear entire cart
export async function DELETE() {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });
    return apiSuccess({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return apiError("Failed to clear cart", 500);
  }
}
