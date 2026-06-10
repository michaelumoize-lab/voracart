// app/api/admin/settings/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { z } from "zod";

const settingsSchema = z.object({
    siteName: z.string().min(1, "Site name is required"),
    siteDescription: z.string().optional(),
    contactEmail: z.string().email("Invalid email format"),
    contactPhone: z.string().optional(),
    maintenanceMode: z.boolean(),
    allowNewRegistrations: z.boolean(),
    maxOrderAmount: z.number().min(0),
    currency: z.string().min(1, "Currency is required"),
});

export async function GET() {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }

    try {
        // For now, return default settings. In a real app, you'd store this in a settings table
        const settings = {
            siteName: "VoraCart",
            siteDescription: "A modern e-commerce platform",
            contactEmail: "support@voracart.com",
            contactPhone: "",
            maintenanceMode: false,
            allowNewRegistrations: true,
            maxOrderAmount: 50000,
            currency: "INR",
        };

        return apiSuccess({ settings });
    } catch (error) {
        console.error("Fetch settings error:", error);
        return apiError("Failed to fetch settings", 500);
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }

    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return apiError("Invalid JSON body", 400);
        }
            const validatedSettings = settingsSchema.parse(body);

        const settings = await prisma.systemSettings.upsert({
            where: { id: 1 },
            create: {
                id: 1,
                ...validatedSettings,
            },
            update: {
                ...validatedSettings,
            },
        });

        return apiSuccess({
            settings,
            message: "Settings updated successfully",
        });
    } catch (error) {
        console.error("Update settings error:", error);
        if (error instanceof z.ZodError) {
            return apiError("Invalid input: " + error.issues[0].message, 400);
        }
        return apiError("Failed to update settings", 500);
    }
}