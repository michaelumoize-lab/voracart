//app/(public)/products/page.tsx
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { ProductListItem } from "@/types";
import AllProductsClient from "./AllProductsClient";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
  }>;
}

const PAGE_SIZE = 20;

// Only select the columns the listing actually renders. Avoids pulling
// description/tags/etc. for 20 products on every request.
const productListSelect = {
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
    select: { url: true, alt: true, position: true, createdAt: true },
  },
  store: {
    select: { id: true, name: true, slug: true, rating: true },
  },
} satisfies Prisma.ProductSelect;

type ListedProduct = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

function serializeProduct(product: ListedProduct): ProductListItem {
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
      createdAt: img.createdAt.toISOString(),
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

// Cache the page-1/no-filter case (and any other combo that gets hit
// repeatedly) for a short window. Tag it so a product create/update/delete
// route can call `revalidateTag("products")` to bust it immediately.
const getProductsPage = unstable_cache(
  async (
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    skip: number,
    take: number,
  ) => {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        select: productListSelect,
      }),
      prisma.product.count({ where }),
    ]);

    return { products: products.map(serializeProduct), total };
  },
  ["products-page"],
  { revalidate: 60, tags: ["products"] },
);

// Price bounds barely change — cache them much longer.
const getPriceBounds = unstable_cache(
  async () => {
    const agg = await prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    });
    return {
      min: agg._min.price ? Math.floor(Number(agg._min.price)) : 0,
      max: agg._max.price ? Math.ceil(Number(agg._max.price)) : 0,
    };
  },
  ["products-price-bounds"],
  { revalidate: 3600, tags: ["products"] },
);

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;
  const inStockOnly = params.inStock === "true";

  // Only ever show products customers can actually buy.
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (params.category && params.category !== "all") {
    where.category = params.category;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !Number.isNaN(minPrice)) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      where.price.lte = maxPrice;
    }
  }

  if (minRating !== undefined && !Number.isNaN(minRating) && minRating > 0) {
    where.rating = { gte: minRating };
  }

  if (inStockOnly) {
    where.stock = { gt: 0 };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (params.sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "rating_desc":
      orderBy = { rating: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  let total = 0;
  let error: string | undefined;
  let serializedProducts: ProductListItem[] = [];
  let priceBounds = { min: 0, max: 0 };

  try {
    const [{ products, total: fetchedTotal }, bounds] = await Promise.all([
      getProductsPage(where, orderBy, skip, PAGE_SIZE),
      getPriceBounds(),
    ]);

    serializedProducts = products;
    total = fetchedTotal;
    priceBounds = bounds;
  } catch (err) {
    console.error("Error fetching products:", err);
    error = "We couldn't load products right now. Please try again.";
  }

  return (
    <AllProductsClient
      initialProducts={serializedProducts}
      total={total}
      currentPage={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      pageSize={PAGE_SIZE}
      categoryFilter={params.category || "all"}
      searchQuery={params.search || ""}
      sortBy={params.sort || "newest"}
      minPrice={minPrice}
      maxPrice={maxPrice}
      minRating={minRating ?? 0}
      inStockOnly={inStockOnly}
      priceBounds={priceBounds}
      error={error}
    />
  );
}
