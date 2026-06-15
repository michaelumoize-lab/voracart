//app/(public)/products/[id]/RelatedProductsSection.tsx
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/Products/ProductCard";
import type { ProductListItem } from "@/types";

interface RelatedProductsSectionProps {
  category: string;
  excludeId: string;
}

const RELATED_LIMIT = 5;

const relatedSelect = {
  id: true,
  name: true,
  slug: true,
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
    take: 1,
    select: { url: true, alt: true, position: true },
  },
  store: {
    select: { id: true, name: true, slug: true, rating: true },
  },
} satisfies Prisma.ProductSelect;

type RelatedProduct = Prisma.ProductGetPayload<{
  select: typeof relatedSelect;
}>;

function serializeProduct(product: RelatedProduct): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    stock: product.stock,
    category: product.category,
    rating: product.rating ? Number(product.rating) : 0,
    reviewCount: product.reviewCount,
    tags: product.tags,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    image: product.images[0]?.url ?? "/placeholder-product.png",
    images: product.images.map((img, idx) => ({
      id: `${product.id}-img-${idx}`,
      productId: product.id,
      url: img.url,
      alt: img.alt,
      position: img.position,
      createdAt: product.createdAt.toISOString(),
    })),
    seller: product.store
      ? {
          id: product.store.id,
          name: product.store.name,
          slug: product.store.slug,
          rating: product.store.rating
            ? Number(product.store.rating)
            : undefined,
        }
      : undefined,
    storeId: product.store?.id ?? "",
  };
}

export default async function RelatedProductsSection({
  category,
  excludeId,
}: RelatedProductsSectionProps) {
  const related = await prisma.product.findMany({
    where: {
      category,
      id: { not: excludeId },
      isActive: true,
    },
    take: RELATED_LIMIT,
    orderBy: { rating: "desc" },
    select: relatedSelect,
  });

  if (related.length === 0) return null;

  const products = related.map(serializeProduct);

  return (
    <section className="border-t border-border pt-10">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Related <span className="text-primary">Products</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
