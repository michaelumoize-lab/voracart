// app/api/products/route.ts
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { NextRequest } from "next/server";
import { createProductSchema, updateProductSchema } from "@/lib/schemas";
import { getServerSession } from "@/lib/get-session";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// GET - Fetch products
export async function GET(request: NextRequest) {
  console.log("API route hit: /api/products");
  const { searchParams } = new URL(request.url);
  const MAX_LIMIT = 100;
  const parsedLimit = parseInt(searchParams.get("limit") || "50", 10);
  const limit =
    Number.isNaN(parsedLimit) || parsedLimit < 1
      ? 50
      : Math.min(parsedLimit, MAX_LIMIT);

  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const sortBy = searchParams.get("sortBy");

  try {
    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) where.price.gte = min;
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) where.price.lte = max;
      }
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        where.rating = { gte: rating };
      }
    }

    // Build order by
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sortBy === "rating_desc") {
      orderBy = { rating: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      take: limit,
      where,
      orderBy,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            rating: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
          take: 1, // Only get the primary image for performance
        },
      },
    });

    // Transform products to match frontend expected format
    const transformedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
      rating: Number(product.rating),
      image:
        product.images.length > 0
          ? product.images[0].url
          : "/placeholder-product.png",
      images: product.images,
      seller: product.store, // Map store to seller for frontend compatibility
    }));
    console.log(`Found ${products.length} products`);

    return apiSuccess({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return apiError("Failed to fetch products", 500);
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  // Only sellers and admins can create products
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can create products", 403);
  }

  try {
    const body = await request.json();
    const validated = createProductSchema.parse(body);

    // Get the user's store
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      return apiError(
        "Product name must contain at least one alphanumeric character",
        400,
      );
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name: validated.name,
        slug,
        description: validated.description,
        price: validated.price,
        offerPrice: validated.offerPrice ?? null,
        stock: validated.stock ?? 0,
        category: validated.category,
        tags: validated.tags ?? [],
        isActive: true,
        images:
          validated.image && validated.image.length > 0
            ? {
                create: validated.image.map((url, index) => ({
                  url,
                  alt: `${validated.name} image ${index + 1}`,
                  position: index,
                })),
              }
            : undefined,
      },
      include: {
        images: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Transform products to match frontend expected format
    const transformedProduct = {
      ...product,
      price: Number(product.price),
      offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
      rating: Number(product.rating),
      image:
        product.images.length > 0
          ? product.images[0].url
          : "/placeholder-product.png",
      seller: product.store,
    };

    return apiSuccess({ product: transformedProduct }, 201);
  } catch (error) {
    console.error("Create product error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return apiError(message, 400);
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return apiError("A product with this slug already exists", 400);
      }
      return apiError("Database error occurred", 500);
    }

    // Handle generic errors
    return apiError(
      error instanceof Error ? error.message : "Failed to create product",
      500,
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const validated = updateProductSchema.parse(body);
    const { id, ...updateData } = validated;

    if (!id) {
      return apiError("Product ID is required", 400);
    }

    // Get the product to check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existingProduct) {
      return apiError("Product not found", 404);
    }

    // Check if user owns the product (via store)
    if (
      existingProduct.store.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return apiError("Unauthorized to update this product", 403);
    }

    // Update slug if name changed
    let slug = existingProduct.slug;
    if (updateData.name && updateData.name !== existingProduct.name) {
      slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: updateData.name,
        slug,
        description: updateData.description,
        price: updateData.price,
        offerPrice: updateData.offerPrice ?? null,
        stock: updateData.stock,
        category: updateData.category,
        tags: updateData.tags,
        isActive: updateData.isActive,
        // Handle images update only when a non-empty image array is provided
        ...(Array.isArray(updateData.image) &&
          updateData.image.length > 0 && {
            images: {
              deleteMany: {},
              create: updateData.image.map((url: string, index: number) => ({
                url,
                alt: `${updateData.name || existingProduct.name} image ${index + 1}`,
                position: index,
              })),
            },
          }),
      },
      include: {
        images: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const transformedProduct = {
      ...product,
      price: Number(product.price),
      offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
      rating: Number(product.rating),
      image:
        product.images.length > 0
          ? product.images[0].url
          : "/placeholder-product.png",
      seller: product.store,
    };

    return apiSuccess({ product: transformedProduct });
  } catch (error) {
    console.error("Update product error:", error);

    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return apiError(message, 400);
    }

    return apiError("Failed to update product", 500);
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Product ID is required", 400);
    }

    // Get the product to check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existingProduct) {
      return apiError("Product not found", 404);
    }

    // Check if user owns the product (via store)
    if (
      existingProduct.store.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return apiError("Unauthorized to delete this product", 403);
    }

    await prisma.product.delete({
      where: { id },
    });

    return apiSuccess({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return apiError("Failed to delete product", 500);
  }
}
