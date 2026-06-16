// components/Landing/HomeProducts.tsx (Server Component)
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import ProductCard from "@/components/Products/ProductCard";
import { prisma } from "@/lib/prisma";
import { serializeProductList } from "@/lib/serialize";

interface HomeProductsProps {
  limit?: number;
}

export default async function HomeProducts({ limit = 10 }: HomeProductsProps) {
  // Fetch products directly on the server (no API call needed)
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    take: limit,
    orderBy: { rating: "desc" }, // Popular products by rating
    include: {
      images: {
        take: 1,
        orderBy: { position: "asc" },
      },
      store: true,
    },
  });

  // Use the centralized serializer
  const serializedProducts = serializeProductList(products);

  const hasProducts = serializedProducts.length > 0;

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

        {hasProducts && (
          <Link
            href="/products"
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
        {!hasProducts ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
              <Flame className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground/60">Check back soon</p>
          </div>
        ) : (
          serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {hasProducts && (
        <>
          <div className="mt-10 flex justify-center md:hidden">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              See all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 hidden md:flex flex-col items-center gap-2">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-10 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
            >
              Explore all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Showing {serializedProducts.length} trending products
            </p>
          </div>
        </>
      )}
    </section>
  );
}
