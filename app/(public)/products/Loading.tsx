import { ProductGridSkeleton } from "@/components/Products/ProductsSkeletons";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="h-11 flex-1 bg-muted rounded-lg" />
          <div className="h-11 sm:w-56 bg-muted rounded-lg" />
          <div className="h-11 w-28 bg-muted rounded-lg lg:hidden" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 bg-muted rounded-lg" />
                <div className="h-8 bg-muted rounded-lg" />
                <div className="h-8 bg-muted rounded-lg" />
              </div>
            ))}
          </aside>

          {/* Grid */}
          <div>
            <div className="h-4 w-40 bg-muted rounded mb-4" />
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
