import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// GET /api/notifications — fetch current user's notifications (most recent 30)
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });

    return apiSuccess({ notifications, unreadCount });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    return apiError("Failed to fetch notifications", 500);
  }
}

// PATCH /api/notifications — mark all as read (or specific id via body)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  try {
    let notificationId: string | undefined;
    try {
      const body = await req.json();
      notificationId = body?.id;
    } catch {
      // no body — mark all
    }

    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: session.user.id },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
    }

    return apiSuccess({ marked: true });
  } catch (err) {
    console.error("Mark notifications error:", err);
    return apiError("Failed to mark notifications", 500);
  }
}
