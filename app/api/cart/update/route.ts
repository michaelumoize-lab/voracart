import { NextRequest } from "next/server";
import { checkArcjet, apiSuccess, apiError } from "@/lib/api-helper";
import { apiRateLimit } from "@/lib/arcjet";
import { updateCartSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function POST(req: NextRequest) {
  const protection = await checkArcjet(req, apiRateLimit);
  if (protection.blocked) return protection.response;

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

  // 4. Update DB
  try {
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
      });
      return apiSuccess({ message: "Item removed from cart" });
    }

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
    return apiError(
      `Failed to update cart: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
