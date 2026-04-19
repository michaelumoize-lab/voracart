// app/api/admin/messages/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { z } from "zod";

const createMessageSchema = z.object({
    type: z.enum(["info", "warning", "error", "success"]),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    targetAudience: z.enum(["all", "sellers", "buyers", "admins"]),
    expiresAt: z.string().optional(),
});

export async function GET() {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }
    try {
        // In a real app, you'd have a SystemMessages table
        // For now, return mock data
        const messages = [
            {
                id: "1",
                type: "info",
                title: "Welcome to VoraCart",
                message: "Thank you for using our platform. We're here to help you succeed.",
                targetAudience: "all",
                isActive: true,
                createdAt: new Date().toISOString(),
                expiresAt: null,
            },
        ];

        return apiSuccess({ messages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return apiError("Failed to fetch messages", 500);
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }

    try {
        const body = await request.json();
        const validatedData = createMessageSchema.parse(body);

        // In a real app, you'd save to database and send notifications
        // For now, just validate and return success
        const message = {
            id: Date.now().toString(),
            ...validatedData,
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: validatedData.expiresAt || null,
        };

        return apiSuccess({
            message,
            notificationCount: 1, // Mock notification count
        });
    } catch (error) {
        console.error("Create message error:", error);
        if (error instanceof z.ZodError) {
            return apiError("Invalid input: " + error.issues[0].message, 400);
        }
        return apiError("Failed to create message", 500);
    }
}