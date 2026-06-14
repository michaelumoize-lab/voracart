// components/ui/product-rating.tsx
import { Star, StarHalf } from "lucide-react";

interface ProductRatingProps {
  rating: number; // Average rating from database (0-5)
  reviewCount?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProductRating({
  rating,
  reviewCount,
  showCount = true,
  size = "md",
}: ProductRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {/* Full Stars */}
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star
              key={`full-${i}`}
              className={`${starSizes[size]} fill-yellow-400 text-yellow-400`}
            />
          ))}

        {/* Half Star */}
        {hasHalfStar && (
          <StarHalf
            className={`${starSizes[size]} fill-yellow-400 text-yellow-400`}
          />
        )}

        {/* Empty Stars */}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star
              key={`empty-${i}`}
              className={`${starSizes[size]} text-gray-300`}
            />
          ))}
      </div>

      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
