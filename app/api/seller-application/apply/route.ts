// app/api/seller-application/apply/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";
import { z } from "zod";

const applySchema = z.object({
  storeName: z.string().min(1),
  description: z.string().min(10),
  phone: z.string().min(5),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  // 🛡️ Prevent sellers from applying
  if (session.user.role === "seller") {
    return apiError("You are already a seller", 400);
  }

  const validation = await validateBody(req, applySchema);
  if (validation.error) return validation.error;

  const { storeName, description, phone } = validation.data;
  const userId = session.user.id;

  const existing = await prisma.sellerApplication.findUnique({
    where: { userId },
  });

  if (existing && existing.status !== "REJECTED") {
    return apiError("You already have a pending or approved application", 400);
  }

  // Upsert – `updatedAt` will be set automatically by Prisma
  const application = await prisma.sellerApplication.upsert({
    where: { userId },
    update: {
      storeName,
      description,
      phone,
      status: "PENDING",
    },
    create: {
      userId,
      storeName,
      description,
      phone,
      status: "PENDING",
    },
  });

  return apiSuccess({ application });
}
