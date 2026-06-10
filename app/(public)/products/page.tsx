// app/(products)/all-products/page.tsx (Server Component)
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Product } from "@/types";
import AllProductsClient from "./AllProductsClient";

interface PageProps {
  searchParams: Promise<{  // ✅ Changed to Promise
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AllProducts({ searchParams }: PageProps) {
  // ✅ Await the searchParams first
  const params = await searchParams;
  
  const pageValue = Number(params.page);
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause with proper typing
  const where: Prisma.ProductWhereInput = {};

  if (params.category && params.category !== "all") {
    where.category = params.category;
  }

  if (params.search) {
    where.name = {
      contains: params.search,
      mode: "insensitive",
    };
  }

  // Get sort order
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (params.sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (params.sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (params.sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  // Fetch products with error handling
  let total = 0;
  let error: string | undefined = undefined;
  let serializedProducts: Product[] = [];

  try {
    const [fetchedProducts, fetchedTotal] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    total = fetchedTotal;

    // Serialize products directly (convert Decimal to number, null to undefined)
    serializedProducts = fetchedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      image: p.image,
      description: p.description ?? undefined,
      userId: p.userId,
      category: p.category,
      offerPrice: p.offerPrice ? Number(p.offerPrice) : undefined,
      stock: p.stock,
      rating: p.rating ?? undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      seller: p.seller
        ? {
            id: p.seller.id,
            name: p.seller.name ?? undefined,
          }
        : undefined,
    }));
  } catch (err) {
    console.error("Error fetching products:", err);
    error = "Failed to load products";
  }

  // Render JSX outside of try/catch
  return (
    <>
      <AllProductsClient
        initialProducts={serializedProducts}
        total={total}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        categoryFilter={params.category || "all"}
        searchQuery={params.search || ""}
        sortBy={params.sort || "newest"}
        error={error}
      />
    </>
  );
}