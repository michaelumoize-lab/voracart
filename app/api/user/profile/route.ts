// app/api/user/profile/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

export async function GET() {
    const session = await getServerSession();
    if (!session?.user) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, whatsappNumber: true, role: true },
    });

    return apiSuccess({ user });
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { name, whatsappNumber } = body;

    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { name, whatsappNumber },
        select: { name: true, email: true, whatsappNumber: true, role: true },
    });

    return apiSuccess({ user: updated });
}