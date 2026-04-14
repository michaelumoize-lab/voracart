// components/ui/five-star-rating.tsx
"use client";

import { Star, StarHalf } from "lucide-react";

interface FiveStarRatingProps {
  rating: number; // 0-5 scale
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function FiveStarRating({ rating, size = "sm", showNumber = false }: FiveStarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < fullStars) {
            return (
              <Star
                key={index}
                className={`${starSize} fill-yellow-400 text-yellow-400`}
              />
            );
          } else if (index === fullStars && hasHalfStar) {
            return (
              <StarHalf
                key={index}
                className={`${starSize} fill-yellow-400 text-yellow-400`}
              />
            );
          } else {
            return (
              <Star
                key={index}
                className={`${starSize} text-gray-300`}
              />
            );
          }
        })}
      </div>
      {showNumber && (
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}