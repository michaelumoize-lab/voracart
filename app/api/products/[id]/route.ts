// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Await params before accessing its properties
  const { id } = await params;
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, whatsappNumber: true },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  
  // ✅ Await params before accessing its properties
  const { id } = await params;
  
  try {
    const body = await request.json();
    
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return apiError("Product not found", 404);
    }
    
    if (existingProduct.userId !== session.user.id && session.user.role !== "admin") {
      return apiError("You can only edit your own products", 403);
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        category: body.category,
        offerPrice: body.offerPrice,
        stock: body.stock,
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  
  // ✅ Await params before accessing its properties
  const { id } = await params;
  
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return apiError("Product not found", 404);
    }
    
    if (existingProduct.userId !== session.user.id && session.user.role !== "admin") {
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