// app/api/admin/products/[id]/toggle-active/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!product) return apiError("Product not found", 404);

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
    select: { isActive: true },
  });

  return apiSuccess({
    isActive: updated.isActive,
    message: `Product ${updated.isActive ? "activated" : "deactivated"}`,
  });
}
