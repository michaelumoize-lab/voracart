// app/api/admin/products/[id]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;

  // Fetch product with a check for order items
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      orderItems: {
        take: 1, // only need to know if any exist
        select: { id: true },
      },
    },
  });

  if (!product) return apiError("Product not found", 404);

  if (product.orderItems.length > 0) {
    return apiError(
      "Cannot delete product with existing orders. Deactivate it instead.",
      400,
    );
  }

  // Atomic conditional delete closes the check-then-act race window
  const { count } = await prisma.product.deleteMany({
    where: { id, orderItems: { none: {} } },
  });
  if (count === 0) {
    return apiError(
      "Cannot delete product with existing orders. Deactivate it instead.",
      400,
    );
  }
  return apiSuccess({ message: "Product deleted successfully" });
}
