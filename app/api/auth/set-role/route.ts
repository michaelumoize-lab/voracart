// app/api/auth/set-role/route.ts
import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiSuccess({ message: "No session" });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "buyer" },
  });
  
  return apiSuccess({ message: "Role set" });
}