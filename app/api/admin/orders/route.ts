// app/api/admin/orders/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { z } from "zod";

const updateOrderSchema = z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status && status !== "all") {
            where.status = status.toUpperCase();
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    image: true,
                                    seller: {           // ✅ fixed
                                        select: { id: true }
                                    }
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        const formattedOrders = orders.map(order => ({
            id: order.id,
            status: order.status,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            shippingDetails: {
                name: order.shippingName,
                phone: order.shippingPhone,
                address: order.shippingAddress,
                city: order.shippingCity,
                state: order.shippingState,
                pincode: order.shippingPincode,
            },
            customer: {
                name: order.user?.name ?? null,
                email: order.user?.email ?? null,
            }, items: order.items.map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price,
                sellerId: item.product.seller?.id,   // ✅ fixed
            })),
        }));

        return apiSuccess({
            orders: formattedOrders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Fetch admin orders error:", error);
        return apiError("Failed to fetch orders", 500);
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }

    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("id");

        if (!orderId) return apiError("Order ID required", 400);

        const body = await request.json();
        const { status } = updateOrderSchema.parse(body);

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            select: { id: true, status: true, updatedAt: true },
        });

        return apiSuccess({
            order: {
                id: order.id,
                status: order.status,
                updatedAt: order.updatedAt,
            },
        });
    } catch (error) {
        console.error("Update order error:", error);
        if (error instanceof z.ZodError) {
            return apiError("Invalid input", 400);
        }
        return apiError("Failed to update order", 500);
    }
}