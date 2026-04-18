// app/api/orders/my-orders/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user) return apiError("Unauthorized", 401);

    try {
        const orders = await prisma.order.findMany({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, image: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const formattedOrders = orders.map(order => ({
            id: order.id,
            status: order.status,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price,
            })),
        }));

        return apiSuccess({ orders: formattedOrders });
    } catch (error) {
        console.error("Fetch orders error:", error);
        return apiError("Failed to fetch orders", 500);
    }
}