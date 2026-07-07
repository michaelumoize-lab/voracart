// app/api/seller-application/apply/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";
import { z } from "zod";

const applySchema = z.object({
  storeName: z.string().min(1).max(50),
  description: z.string().min(10).max(500),
  phone: z
    .string()
    .min(5)
    .regex(/^[\+\d\s\-\(\)]{5,}$/, "Invalid phone number"),
});

export async function POST(req: NextRequest) {
  // 1. Authentication
  const session = await getServerSession();
  if (!session?.user) {
    return apiError("Unauthorized", 401);
  }

  // 2. Only buyers can apply
  if (session.user.role !== "buyer") {
    return apiError("Only buyers can apply to become sellers", 403);
  }

  const userId = session.user.id;

  // 3. Check if user is already a seller (has a store)
  const existingStore = await prisma.store.findUnique({
    where: { userId },
  });
  if (existingStore) {
    return apiError("You are already a seller", 400);
  }

  // 4. Validate request body
  const validation = await validateBody(req, applySchema);
  if (validation.error) return validation.error;

  const { storeName, description, phone } = validation.data;

  // 5. Check existing application
  const existingApplication = await prisma.sellerApplication.findUnique({
    where: { userId },
  });

  // If there's a pending or approved application, block reapplication
  if (existingApplication && existingApplication.status !== "REJECTED") {
    return apiError("You already have a pending or approved application", 400);
  }

  // 6. Upsert – if rejected, update; otherwise create
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
