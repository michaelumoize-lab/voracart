// app/api/auth/set-role/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "buyer" },
    });

    return apiSuccess({ message: "Role set" });
  } catch (error) {
    console.error("Failed to set role:", error);
    return apiError("Unable to set user role", 500);
  }
}