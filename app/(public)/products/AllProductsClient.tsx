// app/shop/AllProductsClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/Products/ProductCard";
import { ProductGridSkeleton } from "@/components/Products/ProductsSkeletons";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";

interface ShopClientProps {
  initialProducts: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  categoryFilter: string;
  searchQuery: string;
  sortBy: string;
  error?: string;
}

export default function AllProductsClient({
  initialProducts,
  total,
  currentPage: initialPage,
  totalPages: initialTotalPages,
  categoryFilter: initialCategory,
  searchQuery: initialSearch,
  sortBy: initialSort,
  error,
}: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearch(initialSearch);
    setCategoryFilter(initialCategory);
    setSortBy(initialSort);
    setCurrentPage(initialPage);
  }, [initialSearch, initialCategory, initialSort, initialPage]);

  const updateFilters = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams();

    const newCategory =
      updates.category !== undefined
        ? (updates.category as string)
        : categoryFilter;
    const newSearch =
      updates.search !== undefined ? (updates.search as string) : search;
    const newSort =
      updates.sort !== undefined ? (updates.sort as string) : sortBy;
    const newPage = updates.page !== undefined ? (updates.page as number) : 1;

    if (newCategory && newCategory !== "all")
      params.set("category", newCategory);
    if (newSearch) params.set("search", newSearch);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    if (newPage > 1) params.set("page", newPage.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateFilters({ search, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
    updateFilters({ category, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateFilters({ sort, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setSearch("");
    setSortBy("newest");
    setCurrentPage(1);
    router.push(pathname);
  };

  const hasActiveFilters =
    categoryFilter !== "all" || search.trim().length > 0 || sortBy !== "newest";

  // Show error state
  if (error) {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">All Products</h1>
          <p className="text-muted-foreground mt-2">
            Browse our collection of products from trusted sellers
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
          </div>

          {/* Category Filter - Desktop */}
          <div className="hidden md:block">
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="hidden md:block">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:underline"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {initialProducts.length} of {total} products
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {initialProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground">No products found</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Pagination */}
        {initialTotalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="px-3 py-1 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-muted-foreground">
              Page {currentPage} of {initialTotalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === initialTotalPages}
              aria-label="Next page"
              className="px-3 py-1 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={() => {
                setCurrentPage(1);
                updateFilters({
                  category: categoryFilter,
                  sort: sortBy,
                  page: 1,
                });
                setIsFilterOpen(false);
              }}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
