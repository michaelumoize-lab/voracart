// app/api/admin/messages/logs/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { getServerSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
        return apiError("Unauthorized", 401);
    }
    try {
        // In a real app, you'd query notification logs from database
        // For now, return mock data
        const logs = [
            {
                id: "1",
                type: "system_message",
                recipient: "all_users",
                subject: "Welcome Message",
                status: "sent",
                sentAt: new Date().toISOString(),
            },
        ];

        return apiSuccess({ logs });
    } catch (error) {
        console.error("Fetch logs error:", error);
        return apiError("Failed to fetch notification logs", 500);
    }
}