import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 10;

    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ products });

  } catch (error) {
    console.error("GET /products error:", error);
    return apiError("Failed to fetch products", 500);
  }
}
