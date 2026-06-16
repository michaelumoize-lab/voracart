// app/api/reviews/route.ts
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { productId, rating, title, body: reviewBody } = body;

    if (!productId || rating == null || title == null || reviewBody == null) {
      return apiError("productId, rating, title, and body are required", 400);
    }

    if (typeof title !== "string" || !title.trim()) {
      return apiError("Title cannot be empty", 400);
    }

    if (typeof reviewBody !== "string" || !reviewBody.trim()) {
      return apiError("Review body cannot be empty", 400);
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return apiError("Rating must be a number between 1 and 5", 400);
    }
    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
        storeId: true,
        name: true,
      },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return apiError("You have already reviewed this product", 400);
    }

    // ✅ CRITICAL: Check if user has purchased and received this product
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!deliveredOrder) {
      return apiError(
        "You can only review products you have purchased and received. Please ensure your order has been delivered.",
        403,
      );
    }

    // Create the review with orderId linked
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        body: reviewBody,
        orderId: deliveredOrder.id, // Link to the delivered order
      },
    });

    // Recalculate product average rating and count
    const productReviews = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Update product with new average and count
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: productReviews._avg.rating || 0,
        reviewCount: productReviews._count.rating || 0,
      },
    });

    // Create notification for the store owner
    const store = await prisma.store.findUnique({
      where: { id: product.storeId },
      select: {
        userId: true,
        name: true,
        user: {
          select: { email: true },
        },
      },
    });

    if (store) {
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: "NEW_REVIEW",
          message: `New ${rating}★ review for "${product.name}" in your store "${store.name}"`,
          link: `/seller/products/${productId}`,
        },
      });
    }

    // Return success with review data
    return apiSuccess({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.createdAt,
      },
      message: "Thank you for your review!",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return apiError("Failed to create review", 500);
  }
}
