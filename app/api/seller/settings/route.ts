// app/api/seller/settings/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        whatsappNumber: true,
      },
    });

    return apiSuccess({
      data: {
        storeName: user?.name || "",
        whatsappNumber: user?.whatsappNumber || "",
        description: "",
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

  try {
    const { storeName, whatsappNumber, description } = await request.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: storeName,
        whatsappNumber,
      },
    });

    return apiSuccess({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return apiError("Failed to update settings", 500);
  }
}