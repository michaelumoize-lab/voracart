// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ✅ Await params before accessing its properties
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
          },
        },
      },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    return apiSuccess({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
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

  // ✅ Await params before accessing its properties
  const { id } = await params;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existingProduct) {
      return apiError("Product not found", 404);
    }

    if (
      existingProduct.store?.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return apiError("You can only edit your own products", 403);
    }

    // Basic validation - consider using Zod for comprehensive schema validation
    if (
      body.price !== undefined &&
      (typeof body.price !== "number" || body.price < 0)
    ) {
      return apiError("Price must be a non-negative number", 400);
    }
    if (
      body.stock !== undefined &&
      (typeof body.stock !== "number" ||
        body.stock < 0 ||
        !Number.isInteger(body.stock))
    ) {
      return apiError("Stock must be a non-negative integer", 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.offerPrice !== undefined && { offerPrice: body.offerPrice }),
        ...(body.stock !== undefined && { stock: body.stock }),
      },
    });
    return apiSuccess({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return apiError("Failed to update product", 500);
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  // ✅ Await params before accessing its properties
  const { id } = await params;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!existingProduct) {
      return apiError("Product not found", 404);
    }

    if (
      existingProduct.store?.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return apiError("You can only delete your own products", 403);
    }

    await prisma.product.delete({
      where: { id },
    });

    return apiSuccess({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return apiError("Failed to delete product", 500);
  }
}
