"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface FiltersSidebarProps {
  category: string;
  onCategoryChange: (category: string) => void;
  priceBounds: { min: number; max: number };
  minPrice: string;
  maxPrice: string;
  onPriceApply: (min: string, max: string) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

const RATING_OPTIONS = [4, 3, 2, 1];

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= value
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground"
          }`}
        />
      ))}
    </span>
  );
}

export default function FiltersSidebar({
  category,
  onCategoryChange,
  priceBounds,
  minPrice,
  maxPrice,
  onPriceApply,
  minRating,
  onRatingChange,
  inStockOnly,
  onInStockChange,
  hasActiveFilters,
  onClearAll,
}: FiltersSidebarProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPriceApply(localMin, localMax);
  };

  const categoryButtonClass = (isActive: boolean) =>
    `block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Category">
        <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={categoryButtonClass(category === "all")}
          >
            All categories
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={categoryButtonClass(category === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price range">
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₦
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                placeholder={priceBounds.min.toString()}
                className="w-full rounded-lg border border-border bg-background pl-7 pr-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="text-muted-foreground">–</span>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₦
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                placeholder={priceBounds.max.toString()}
                className="w-full rounded-lg border border-border bg-background pl-7 pr-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Apply
          </button>
        </form>
      </FilterGroup>

      <FilterGroup title="Minimum rating">
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => onRatingChange(0)}
            className={categoryButtonClass(minRating === 0)}
          >
            Any rating
          </button>
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRatingChange(r)}
              className={`flex w-full items-center gap-2 ${categoryButtonClass(
                minRating === r,
              )}`}
            >
              <RatingStars value={r} />
              <span>& up</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          In stock only
        </label>
      </FilterGroup>
    </div>
  );
}
