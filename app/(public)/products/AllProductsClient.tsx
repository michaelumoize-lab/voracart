"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/Products/ProductCard";
import FiltersSidebar from "@/app/(public)/products/FiltersSidebar";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  PackageSearch,
} from "lucide-react";
import type { ProductListItem } from "@/types";

interface AllProductsClientProps {
  initialProducts: ProductListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  categoryFilter: string;
  searchQuery: string;
  sortBy: string;
  minPrice?: number;
  maxPrice?: number;
  minRating: number;
  inStockOnly: boolean;
  priceBounds: { min: number; max: number };
  error?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Top Rated" },
];

type FilterUpdates = Partial<{
  category: string;
  search: string;
  sort: string;
  page: number;
  minPrice: string;
  maxPrice: string;
  minRating: number;
  inStock: boolean;
}>;

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }
  return pages;
}

export default function AllProductsClient({
  initialProducts,
  total,
  currentPage: initialPage,
  totalPages,
  categoryFilter: initialCategory,
  searchQuery: initialSearch,
  sortBy: initialSort,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  minRating: initialMinRating,
  inStockOnly: initialInStockOnly,
  priceBounds,
  error,
}: AllProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [minPrice, setMinPrice] = useState(initialMinPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice?.toString() ?? "");
  const [minRating, setMinRating] = useState(initialMinRating);
  const [inStockOnly, setInStockOnly] = useState(initialInStockOnly);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearch(initialSearch);
    setCategory(initialCategory);
    setSortBy(initialSort);
    setCurrentPage(initialPage);
    setMinPrice(initialMinPrice?.toString() ?? "");
    setMaxPrice(initialMaxPrice?.toString() ?? "");
    setMinRating(initialMinRating);
    setInStockOnly(initialInStockOnly);
  }, [
    initialSearch,
    initialCategory,
    initialSort,
    initialPage,
    initialMinPrice,
    initialMaxPrice,
    initialMinRating,
    initialInStockOnly,
  ]);

  const updateFilters = (updates: FilterUpdates) => {
    const next = {
      category: updates.category ?? category,
      search: updates.search ?? search,
      sort: updates.sort ?? sortBy,
      page: updates.page ?? 1,
      minPrice: updates.minPrice ?? minPrice,
      maxPrice: updates.maxPrice ?? maxPrice,
      minRating: updates.minRating ?? minRating,
      inStock: updates.inStock ?? inStockOnly,
    };

    const params = new URLSearchParams();
    if (next.category && next.category !== "all")
      params.set("category", next.category);
    if (next.search) params.set("search", next.search);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.minRating > 0) params.set("minRating", String(next.minRating));
    if (next.inStock) params.set("inStock", "true");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: value, page: 1 });
    }, 300);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateFilters({ category: value, page: 1 });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sort: value, page: 1 });
  };

  const handlePriceApply = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateFilters({ minPrice: min, maxPrice: max, page: 1 });
  };

  const handleRatingChange = (value: number) => {
    setMinRating(value);
    updateFilters({ minRating: value, page: 1 });
  };

  const handleInStockChange = (value: boolean) => {
    setInStockOnly(value);
    updateFilters({ inStock: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    category !== "all" ||
    search.trim().length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating > 0 ||
    inStockOnly;

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  type Chip = { key: string; label: string; onRemove: () => void };
  const chips: Chip[] = [];
  if (category !== "all") {
    chips.push({
      key: "category",
      label: category,
      onRemove: () => handleCategoryChange("all"),
    });
  }
  if (search.trim().length > 0) {
    chips.push({
      key: "search",
      label: `"${search}"`,
      onRemove: () => {
        setSearch("");
        updateFilters({ search: "", page: 1 });
      },
    });
  }
  if (minPrice !== "" || maxPrice !== "") {
    const label =
      minPrice && maxPrice
        ? `₦${minPrice} – ₦${maxPrice}`
        : minPrice
          ? `Over ₦${minPrice}`
          : `Under ₦${maxPrice}`;
    chips.push({
      key: "price",
      label,
      onRemove: () => handlePriceApply("", ""),
    });
  }
  if (minRating > 0) {
    chips.push({
      key: "rating",
      label: `${minRating}★ & up`,
      onRemove: () => handleRatingChange(0),
    });
  }
  if (inStockOnly) {
    chips.push({
      key: "inStock",
      label: "In stock only",
      onRemove: () => handleInStockChange(false),
    });
  }

  const filtersProps = {
    category,
    onCategoryChange: handleCategoryChange,
    priceBounds,
    minPrice,
    maxPrice,
    onPriceApply: handlePriceApply,
    minRating,
    onRatingChange: handleRatingChange,
    inStockOnly,
    onInStockChange: handleInStockChange,
    hasActiveFilters,
    onClearAll: clearFilters,
  };

  if (error) {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            All Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse our collection of products from trusted sellers
          </p>
        </div>

        {/* Search + sort + mobile filter trigger */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-56"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-primary hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FiltersSidebar {...filtersProps} />
            </div>
          </aside>

          {/* Main content */}
          <div>
            <div className="text-sm text-muted-foreground mb-4">
              Showing {initialProducts.length} of {total} products
            </div>

            {initialProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 gap-3 border border-dashed border-border rounded-xl">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <PackageSearch className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No products found</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Try adjusting your filters or search for something else.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {initialProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers.map((p, idx) =>
                  p === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-sm text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-background rounded-t-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <FiltersSidebar {...filtersProps} />

            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full mt-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Show {initialProducts.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
