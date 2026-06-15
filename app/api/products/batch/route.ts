import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, checkRateLimit } from "@/lib/api-helper";
import { Prisma } from "@prisma/client";

const batchQuerySchema = z.object({
  ids: z.string().min(1),
});

// Define the select with proper typing using satisfies
const productSelect = {
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

// Infer the return type from the select
type BatchProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = checkRateLimit(ip, 30);
  if (rateLimit.blocked) {
    return apiError("Too many requests", 429);
  }

  const idsParam = req.nextUrl.searchParams.get("ids");
  const validation = batchQuerySchema.safeParse({ ids: idsParam ?? "" });
  if (!validation.success) {
    return apiError("Missing or invalid 'ids' parameter", 400);
  }

  const ids = validation.data.ids.split(",").filter(Boolean);
  if (ids.length === 0) {
    return apiSuccess({ products: [] });
  }

  if (ids.length > 50) {
    return apiError("Too many product IDs requested (max 50)", 400);
  }

  try {
    const products: BatchProduct[] = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      select: productSelect,
    });

    const serialized = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
      stock: product.stock,
      category: product.category,
      rating: Number(product.rating),
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
        alt: img.alt ?? product.name,
        position: img.position,
        createdAt: product.createdAt.toISOString(),
      })),
      seller: product.store
        ? {
            id: product.store.id,
            name: product.store.name,
            slug: product.store.slug,
            rating: Number(product.store.rating),
          }
        : undefined,
      storeId: product.store?.id ?? "",
    }));

    return apiSuccess({ products: serialized });
  } catch (error) {
    console.error("Batch products API error:", error);
    return apiError("Internal server error", 500);
  }
}
