import React from "react";

// Single product card skeleton - matches ProductCard component exactly
export const ProductCardSkeleton = () => (
  <div className="flex flex-col items-start gap-0.5 max-w-[200px] w-full animate-pulse">
    {/* Image skeleton */}
    <div className="relative bg-muted rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
      <div className="w-4/5 h-4/5 md:w-full md:h-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      {/* Heart icon skeleton */}
      <div className="absolute top-2 right-2 bg-background p-2 rounded-full shadow-md">
        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
    </div>

    {/* Name skeleton */}
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-2" />

    {/* Rating skeleton - matches new ProductRating component */}
    <div className="flex items-center gap-2 mt-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>

    {/* Price + Cart Controls skeleton */}
    <div className="flex items-center justify-between w-full mt-1">
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      {/* Add to cart button skeleton */}
      <div className="max-sm:hidden px-4 py-1.5 rounded-full w-24 h-8 bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

// Grid of product card skeletons
export const ProductGridSkeleton = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Product detail page skeleton - updated to match ProductDetail page structure
export const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery Section */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />

        {/* Rating section */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Description */}
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>

        {/* Stock status */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-2" />

        {/* Store info */}
        <div className="border-t border-border pt-4 mt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center gap-4 mt-4">
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>

    {/* Reviews Section Skeleton */}
    <div className="mt-16">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="md:col-span-2 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border-b border-border pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Single order skeleton - updated for Order type
export const OrderSkeleton = () => (
  <div className="border border-border rounded-lg p-5 space-y-4 animate-pulse">
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full ml-auto" />
    </div>

    {/* Order items skeleton */}
    {[1, 2].map((i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-t border-border pt-3"
      >
        <div className="w-14 h-14 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

// List of order skeletons
export const OrderListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <OrderSkeleton key={i} />
    ))}
  </div>
);

// Seller product list table skeleton - updated for Product type
export const SellerProductSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="animate-pulse space-y-3">
    <div className="flex items-center gap-4 border-b border-border pb-2 mb-2">
      <div className="w-12" />
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-14" />
    </div>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-b border-border py-3"
      >
        <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

// Category filter skeleton
export const CategoryFilterSkeleton = () => (
  <div className="flex gap-2 overflow-x-auto pb-2 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"
      />
    ))}
  </div>
);
