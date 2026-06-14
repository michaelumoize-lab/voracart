import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
    });

    const cart: Record<string, number> = {};
    cartItems.forEach((item) => {
      cart[item.productId] = item.quantity;
    });

    return apiSuccess({ cart });
  } catch (error) {
    console.error("Failed to fetch cart", error);
    return apiError("Failed to fetch cart", 500);
  }
}
