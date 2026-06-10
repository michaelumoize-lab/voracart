// app/api/seller/settings/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { z } from "zod";

// Validation schema for settings update - matches User model
const updateSettingsSchema = z.object({
  storeName: z.string()
    .min(2, "Store name must be at least 2 characters")
    .max(50, "Store name must be at most 50 characters")
    .trim(),
  whatsappNumber: z.string()
    .min(5, "WhatsApp number must be at least 5 characters")
    .max(20, "WhatsApp number must be at most 20 characters")
    .regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, "Invalid phone number format"),
  storeDescription: z.string().max(250, "Store description must be at most 250 characters").optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can access settings", 403);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        whatsappNumber: true,
        storeDescription: true,
      },
    });

    return apiSuccess({
      data: {
        storeName: user?.name || "",
        whatsappNumber: user?.whatsappNumber || "",
        storeDescription: user?.storeDescription || "",
      },
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return apiError("Failed to fetch settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return apiError("Only sellers can update settings", 403);
  }

  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = updateSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(", ");
      return apiError(errorMessages, 400);
    }

    const { storeName, whatsappNumber, storeDescription } = validationResult.data;

    // Update user with validated data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: storeName,
        whatsappNumber,
        storeDescription,
      },
    });

    return apiSuccess({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return apiError("Failed to update settings", 500);
  }
}