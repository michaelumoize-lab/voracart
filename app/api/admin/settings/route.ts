// app/api/admin/settings/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";
import { serializeSettings } from "@/lib/serialize";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Zod schema for PUT request body
const settingsUpdateSchema = z.object({
  siteName: z.string().min(1),
  siteDescription: z.string().nullable().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().nullable().optional(),
  maintenanceMode: z.boolean().optional(),
  allowNewRegistrations: z.boolean().optional(),
  currency: z.string().min(1),
  currencySymbol: z.string().min(1),
  maxOrderAmount: z.number().min(0).optional(),
  shippingFee: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Forbidden", 403);

  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 1 },
    });

    // If no settings exist, create defaults with all required fields
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 1,
          siteName: "VoraCart",
          siteDescription: null,
          contactEmail: "admin@example.com",
          contactPhone: null,
          maintenanceMode: false,
          allowNewRegistrations: true,
          currency: "USD",
          currencySymbol: "$",
          maxOrderAmount: 0,
          shippingFee: 0,
          freeShippingThreshold: 0,
        },
      });
    }

    return apiSuccess({ settings: serializeSettings(settings) });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return apiError("Failed to fetch settings", 500);
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Forbidden", 403);

  // Validate request body with Zod
  const validation = await validateBody(req, settingsUpdateSchema);
  if (validation.error) return validation.error;

  const body = validation.data;

  try {
    // Build update data with proper Prisma types
    const updateData: Prisma.SystemSettingsUpdateInput = {
      siteName: body.siteName,
      siteDescription: body.siteDescription ?? null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone ?? null,
      maintenanceMode: body.maintenanceMode ?? false,
      allowNewRegistrations: body.allowNewRegistrations ?? true,
      currency: body.currency,
      currencySymbol: body.currencySymbol,
    };

    // Only include numeric fields if they are provided (i.e., not undefined)
    if (body.maxOrderAmount !== undefined) {
      updateData.maxOrderAmount = body.maxOrderAmount;
    }
    if (body.shippingFee !== undefined) {
      updateData.shippingFee = body.shippingFee;
    }
    if (body.freeShippingThreshold !== undefined) {
      updateData.freeShippingThreshold = body.freeShippingThreshold;
    }

    // Build create data with fallback defaults for numeric fields
    const createData: Prisma.SystemSettingsCreateInput = {
      id: 1,
      siteName: body.siteName,
      siteDescription: body.siteDescription ?? null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone ?? null,
      maintenanceMode: body.maintenanceMode ?? false,
      allowNewRegistrations: body.allowNewRegistrations ?? true,
      currency: body.currency,
      currencySymbol: body.currencySymbol,
      maxOrderAmount: body.maxOrderAmount ?? 0,
      shippingFee: body.shippingFee ?? 0,
      freeShippingThreshold: body.freeShippingThreshold ?? 0,
    };

    const updated = await prisma.systemSettings.upsert({
      where: { id: 1 },
      create: createData,
      update: updateData,
    });

    return apiSuccess({ settings: serializeSettings(updated) });
  } catch (error) {
    console.error("Error updating settings:", error);
    return apiError("Failed to update settings", 500);
  }
}
