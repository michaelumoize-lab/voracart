import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { NextRequest } from "next/server";
import { createProductSchema } from "@/lib/schemas";
import { getServerSession } from "@/lib/get-session";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// GET - Fetch products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const MAX_LIMIT = 100;
  const parsedLimit = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 
    ? 50 
    : Math.min(parsedLimit, MAX_LIMIT);  
  
  try {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
          },
        },
      },
    });
    
    return apiSuccess({ products });
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
    
    const product = await prisma.product.create({
      data: {
        name: validated.name,
        price: validated.price,
        image: validated.image[0] ?? "",
        description: validated.description,
        userId: session.user.id,
        category: validated.category,
        offerPrice: validated.offerPrice,
        stock: 0,
      },
    });
    
    return apiSuccess({ product }, 201);
  } catch (error) {
    console.error("Create product error:", error);
    
    if (error instanceof ZodError) {
      return apiError(error.issues[0].message, 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return apiError(`Database error: ${error.message}`, 500);
    }
    
    if (error instanceof Error) {
      return apiError(error.message, 500);
    }
    
    return apiError("Failed to create product", 500);
  }
}