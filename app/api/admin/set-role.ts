// app/api/admin/set-role/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  role: z.enum(["buyer", "seller", "admin"]),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  const validation = schema.safeParse(await request.json());
  if (!validation.success) {
    return apiError("Invalid input", 400);
  }

  const { userId, role } = validation.data;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return apiSuccess({ user });
  } catch (error) {
    console.error("Update role error:", error);
    return apiError("Failed to update role", 500);
  }
}
