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

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return apiError("Rating must be a number between 1 and 5", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return apiError("Product not found", 404);
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.user.id,
      },
    });
    if (existingReview) {
      return apiError("You have already reviewed this product", 400);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        body: reviewBody,
      },
    });

    // Recalculate product average rating
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

    return apiSuccess({ review });
  } catch (error) {
    console.error("Error creating review:", error);
    return apiError("Failed to create review", 500);
  }
}
