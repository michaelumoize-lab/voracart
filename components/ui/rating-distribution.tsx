// components/ui/rating-distribution.tsx
import { ProductRating } from "@/components/ui/product-rating";

interface RatingDistributionProps {
  productId: string;
  ratingCounts?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalReviews: number;
  averageRating: number;
}

export function RatingDistribution({
  averageRating,
  totalReviews,
  ratingCounts,
}: RatingDistributionProps) {
  const percentages =
    ratingCounts && totalReviews > 0
      ? Object.entries(ratingCounts).map(([stars, count]) => ({
          stars: parseInt(stars),
          percentage: (count / totalReviews) * 100,
          count,
        }))
      : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
        <div>
          <ProductRating rating={averageRating} showCount={false} />
          <div className="text-sm text-muted-foreground">
            Based on {totalReviews} reviews
          </div>
        </div>
      </div>

      {percentages.map(({ stars, percentage, count }) => (
        <div key={stars} className="flex items-center gap-2">
          <div className="w-12 text-sm">{stars} ★</div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="w-12 text-sm text-muted-foreground">{count}</div>
        </div>
      ))}
    </div>
  );
}
