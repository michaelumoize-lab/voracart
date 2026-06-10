// app/api/products/route.ts
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
        offerPrice: validated.offerPrice ?? null, // ✅ Handle optional
        stock: 0,
      },
    });

    return apiSuccess({ product }, 201);
  } catch (error) {
    console.error("Create product error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return apiError(message, 400);
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return apiError("Database error occurred", 500);
    }

    // Handle generic errors
    return apiError(error instanceof Error ? error.message : "Failed to create product", 500);
  }
}