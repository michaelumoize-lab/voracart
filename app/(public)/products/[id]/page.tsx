//app/(public)/products/[id]/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import type { Product } from "@/types";
import Footer from "@/components/Landing/Footer";
import ProductClient from "./ProductClient";
import ReviewsSection from "./ReviewsSection";
import RelatedProductsSection from "./RelatedProductsSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Revalidate every 2 minutes — product detail pages are read far more often
// than they change, so this turns most requests into a cache hit instead of
// a fresh DB round trip.
export const revalidate = 120;

const productDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  offerPrice: true,
  stock: true,
  category: true,
  rating: true,
  reviewCount: true,
  tags: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  images: {
    orderBy: { position: "asc" as const },
    select: { url: true, alt: true, position: true },
  },
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      logo: true,
      totalSales: true,
    },
  },
} satisfies Prisma.ProductSelect;

type DetailProduct = Prisma.ProductGetPayload<{
  select: typeof productDetailSelect;
}>;

function serializeProduct(product: DetailProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    stock: product.stock,
    category: product.category,
    rating: product.rating ? Number(product.rating) : 0,
    reviewCount: product.reviewCount,
    tags: product.tags,
    isActive: product.isActive,
    images: product.images.map((img) => ({
      id: `${product.id}-img-${img.position}`,
      productId: product.id,
      url: img.url,
      alt: img.alt ?? product.name,
      position: img.position,
      createdAt: product.createdAt.toISOString(),
    })),
    image: product.images[0]?.url ?? "/placeholder-product.png",
    store: product.store
      ? {
          id: product.store.id,
          name: product.store.name,
          slug: product.store.slug,
          rating: product.store.rating
            ? Number(product.store.rating)
            : undefined,
          logo: product.store.logo ?? undefined,
          totalSales: product.store.totalSales,
        }
      : undefined,
    storeId: product.store?.id ?? "",
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  } as Product;
}

function ReviewsSkeleton() {
  return (
    <section className="border-t border-border pt-10 animate-pulse">
      <div className="h-7 w-48 bg-muted rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 sm:gap-12 mb-8">
        <div className="space-y-2">
          <div className="h-10 w-16 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="space-y-2 w-full max-w-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-2 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section className="border-t border-border pt-10 animate-pulse">
      <div className="h-7 w-56 bg-muted rounded mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: productDetailSelect,
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const serializedProduct = serializeProduct(product);

  return (
    <>
      <ProductClient product={serializedProduct} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection
            productId={serializedProduct.id}
            rating={serializedProduct.rating ?? 0}
            reviewCount={serializedProduct.reviewCount ?? 0}
          />
        </Suspense>

        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedProductsSection
            category={serializedProduct.category}
            excludeId={serializedProduct.id}
          />
        </Suspense>
      </div>

      <Footer />
    </>
  );
}
