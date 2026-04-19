// app/api/admin/messages/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { getServerSession } from "@/lib/get-session";
import { z } from "zod";

const updateMessageSchema = z.object({
    isActive: z.boolean(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { isActive } = updateMessageSchema.parse(body);

        // Simulated database update
        const message = {
            id,
            isActive,
            updatedAt: new Date().toISOString(),
        };

        return apiSuccess({ message });
    } catch (error) {
        console.error("Update message error:", error);
        if (error instanceof z.ZodError) {
            return apiError("Invalid input: " + error.issues[0].message, 400);
        }
        return apiError("Failed to update message", 500);
    }
}