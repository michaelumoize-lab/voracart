"use client";

import { ProductGridSkeleton } from "@/components/Products/ProductsSkeletons";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import ProductCard from "@/components/Products/ProductCard";
import { useProducts } from "@/hooks/useProducts"; 

export default function HomeProducts() {
  const { products, loading, error } = useProducts(10); 
  
  if (loading) {
    return (
      <section className="relative py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          <ProductGridSkeleton count={10} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-16">
        <div className="text-center text-red-500">
          <p>Failed to load products</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Trending now
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
            Popular <span className="text-primary">Products</span>
          </h2>
        </div>

        {products.length > 0 && (
          <Link
            href="/all-products"
            className="group hidden md:inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
              <Flame className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground/60">Check back soon</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {products.length > 0 && (
        <>
          <div className="mt-10 flex justify-center md:hidden">
            <Link
              href="/all-products"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              See all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 hidden md:flex flex-col items-center gap-2">
            <Link
              href="/all-products"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-10 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
            >
              Explore all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-muted-foreground">
              {products.length} products available
            </p>
          </div>
        </>
      )}
    </section>
  );
}