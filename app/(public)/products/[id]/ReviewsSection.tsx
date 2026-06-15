// app/(public)/products/[id]/ReviewsSection.tsx
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ProductRating } from "@/components/ui/product-rating";

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
}

export interface RatingBucket {
  star: number;
  count: number;
}

interface ReviewsSectionProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

const REVIEWS_LIMIT = 10;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ReviewsSection({
  productId,
  rating,
  reviewCount,
}: ReviewsSectionProps) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  // Check if user has purchased and received this product
  let canReview = false;
  let hasAlreadyReviewed = false;

  if (userId) {
    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
    hasAlreadyReviewed = !!existingReview;

    // If not reviewed yet, check if user has a DELIVERED order containing this product
    if (!hasAlreadyReviewed) {
      const deliveredOrder = await prisma.order.findFirst({
        where: {
          userId,
          status: "DELIVERED",
          items: {
            some: {
              productId,
            },
          },
        },
        select: { id: true },
      });
      canReview = !!deliveredOrder;
    }
  }

  const [reviewsRaw, ratingGroups] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: REVIEWS_LIMIT,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    }),
  ]);

  const reviews: Review[] = reviewsRaw.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    user: {
      id: r.user.id,
      name: r.user.name ?? "Anonymous",
      image: r.user.image,
    },
  }));

  const ratingDistribution: RatingBucket[] = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratingGroups.find((g) => g.rating === star)?._count.rating ?? 0,
  }));
  const totalReviews = ratingDistribution.reduce((sum, b) => sum + b.count, 0);

  // Determine button state
  let reviewButtonText = "Write a review";
  let reviewButtonDisabled = false;
  let reviewButtonHref = `/products/${productId}/review`;

  if (!userId) {
    reviewButtonText = "Sign in to review";
    reviewButtonHref = `/auth/sign-in?redirect=/products/${productId}`;
  } else if (hasAlreadyReviewed) {
    reviewButtonText = "You already reviewed this product";
    reviewButtonDisabled = true;
  } else if (!canReview) {
    reviewButtonText = "Purchase & receive to review";
    reviewButtonDisabled = true;
  }

  return (
    <section id="reviews" className="border-t border-border pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Customer Reviews
        </h2>
        {!hasAlreadyReviewed && canReview && (
          <Link
            href={reviewButtonHref}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            {reviewButtonText}
          </Link>
        )}
        {reviewButtonDisabled && !hasAlreadyReviewed && (
          <button
            disabled
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground cursor-not-allowed"
            title={
              !userId
                ? "Please sign in to review"
                : "You need to purchase and receive this product before reviewing"
            }
          >
            {reviewButtonText}
          </button>
        )}
        {hasAlreadyReviewed && (
          <button
            disabled
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground cursor-not-allowed"
          >
            {reviewButtonText}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 sm:gap-12 mb-8">
        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3">
          <p className="text-4xl font-bold text-foreground">
            {rating.toFixed(1)}
          </p>
          <div className="flex flex-col gap-1">
            <ProductRating rating={rating} showCount={false} size="md" />
            <p className="text-sm text-muted-foreground">
              {reviewCount} review{reviewCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="space-y-2 w-full max-w-sm">
          {ratingDistribution.map(({ star, count }) => {
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground w-8 shrink-0">
                  {star}
                  <Star className="h-3 w-3 fill-primary text-primary" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-8 text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-foreground font-medium">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {canReview && !hasAlreadyReviewed
              ? "Be the first to share what you think about this product."
              : "Reviews will appear here once customers share their experiences."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-border pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {review.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <ProductRating
                rating={review.rating}
                showCount={false}
                size="sm"
              />
              {review.title && (
                <p className="text-sm font-semibold text-foreground mt-2">
                  {review.title}
                </p>
              )}
              {review.body && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {review.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
