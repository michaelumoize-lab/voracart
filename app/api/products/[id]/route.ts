// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { updateProductSchema } from "@/lib/schemas";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
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
        },
      },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    // Transform to match frontend expected format
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
    console.error("Failed to fetch product:", error);
    return apiError("Failed to fetch product", 500);
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = updateProductSchema.parse(body);

    // Fetch product with store to check ownership
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
    if (validated.name && validated.name !== existingProduct.name) {
      slug = validated.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!slug) {
        return apiError(
          "Product name must contain at least one alphanumeric character",
          400,
        );
      }
    }
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: validated.name,
        slug,
        description: validated.description,
        price: validated.price,
        ...(validated.offerPrice !== undefined && {
          offerPrice: validated.offerPrice ?? null,
        }),
        stock: validated.stock,
        category: validated.category,
        tags: validated.tags,
        isActive: validated.isActive, // Handle image updates only when a new image array is provided
        ...(Array.isArray(validated.image) &&
          validated.image.length > 0 && {
            images: {
              deleteMany: {},
              create: validated.image.map((url, index) => ({
                url,
                alt: `${validated.name || existingProduct.name} image ${index + 1}`,
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
      ...updatedProduct,
      price: Number(updatedProduct.price),
      offerPrice: updatedProduct.offerPrice
        ? Number(updatedProduct.offerPrice)
        : null,
      rating: Number(updatedProduct.rating),
      image:
        updatedProduct.images.length > 0
          ? updatedProduct.images[0].url
          : "/placeholder-product.png",
      seller: updatedProduct.store,
    };

    return apiSuccess({ product: transformedProduct });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return apiError(message, 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return apiError("A product with this slug already exists", 400);
      }
      return apiError("Database error occurred", 500);
    }

    return apiError(
      error instanceof Error ? error.message : "Failed to update product",
      500,
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;

  try {
    // Fetch product with store to check ownership
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
    console.error("Failed to delete product:", error);
    return apiError("Failed to delete product", 500);
  }
}
