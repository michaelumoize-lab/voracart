// app/api/orders/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session?.user) return apiError("Unauthorized", 401);

    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return apiError("Order not found", 404);
        }

        // Verify the order belongs to the current user (or admin)
        if (order.userId !== session.user.id && session.user.role !== "admin") {
            return apiError("Forbidden", 403);
        }

        const formattedOrder = {
            id: order.id,
            status: order.status,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            shippingName: order.shippingName,
            shippingPhone: order.shippingPhone,
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingState: order.shippingState,
            shippingPincode: order.shippingPincode,
            items: order.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.image,
            })),
        };

        return apiSuccess({ order: formattedOrder });
    } catch (error) {
        console.error("Fetch order error:", error);
        return apiError("Failed to fetch order", 500);
    }
}