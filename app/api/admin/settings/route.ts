// app/api/admin/settings/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { serializeSettings } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Forbidden", 403);

  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 1 },
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 1,
          siteName: "VoraCart",
          contactEmail: "admin@example.com",
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

  try {
    const body = await req.json();

    // Validate required fields
    const required = ["siteName", "contactEmail", "currency", "currencySymbol"];
    for (const field of required) {
      if (!body[field]) {
        return apiError(`${field} is required`, 400);
      }
    }

    // Prepare update data
    const updateData = {
      siteName: body.siteName,
      siteDescription: body.siteDescription || null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone || null,
      maintenanceMode: body.maintenanceMode === true,
      allowNewRegistrations: body.allowNewRegistrations === true,
      maxOrderAmount: parseFloat(body.maxOrderAmount),
      currency: body.currency,
      currencySymbol: body.currencySymbol,
      shippingFee: parseFloat(body.shippingFee),
      freeShippingThreshold: body.freeShippingThreshold
        ? parseFloat(body.freeShippingThreshold)
        : null,
    };

    const updated = await prisma.systemSettings.update({
      where: { id: 1 },
      data: updateData,
    });

    return apiSuccess({ settings: serializeSettings(updated) });
  } catch (error) {
    console.error("Error updating settings:", error);
    return apiError("Failed to update settings", 500);
  }
}
