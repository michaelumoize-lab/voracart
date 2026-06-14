import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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