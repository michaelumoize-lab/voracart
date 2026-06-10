// app/api/orders/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { notifySellersOfNewOrder } from "@/lib/notifications";

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user) return apiError("Unauthorized", 401);

    try {
        const body = await request.json();
        const { items, totalAmount, shippingDetails } = body;

        if (!items || !items.length) {
            return apiError("No items in order", 400);
        }

        // Create order with items
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount: totalAmount,
                shippingName: shippingDetails?.name,
                shippingPhone: shippingDetails?.phone,
                shippingAddress: shippingDetails?.address,
                shippingCity: shippingDetails?.city,
                shippingState: shippingDetails?.state,
                shippingPincode: shippingDetails?.pincode,
                status: "PENDING",
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true },
        });

        // Clear user's cart after order placement
        await prisma.cartItem.deleteMany({
            where: { userId: session.user.id },
        });

        // Notify sellers (async, don't await)
        notifySellersOfNewOrder(order.id, session.user.name || "Customer").catch(console.error);

        return apiSuccess({ order }, 201);
    } catch (error) {
        console.error("Create order error:", error);
        return apiError("Failed to create order", 500);
    }
}