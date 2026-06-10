// lib/notifications.ts
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 * Notifications are non-critical — log errors but don't throw
 */
export async function createNotification({
  userId,
  type,
  message,
  link,
}: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link: link ?? null,
        read: false,
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

/**
 * Create multiple notifications at once
 */
export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
): Promise<void> {
  try {
    await Promise.all(notifications.map((n) => createNotification(n)));
  } catch (err) {
    console.error("Failed to create bulk notifications:", err);
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch (err) {
    console.error("Failed to get unread count:", err);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
}

/**
 * Notify all sellers whose products are in a new order
 * Called after order creation
 */
export async function notifySellersOfNewOrder(
  orderId: string,
  buyerName: string
): Promise<void> {
  try {
    // Find all distinct seller userIds from the order's items
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          select: { userId: true, name: true }
        }
      },
    });

    const sellerIds = [...new Set(orderItems.map((i) => i.product.userId))];

    if (sellerIds.length === 0) return;

    await Promise.all(
      sellerIds.map((sellerId) => {
        const sellerProducts = orderItems
          .filter((i) => i.product.userId === sellerId)
          .map((i) => i.product.name)
          .join(", ");

        return createNotification({
          userId: sellerId,
          type: "NEW_ORDER",
          message: `New order from ${buyerName || "a customer"}${sellerProducts ? ` for: ${sellerProducts}` : ""}`,
          link: `/seller/orders/${orderId}`,
        });
      })
    );
  } catch (err) {
    console.error("Failed to notify sellers of new order:", err);
  }
}

/**
 * Notify a buyer that their order status has been updated
 */
export async function notifyBuyerOfStatusUpdate(
  orderId: string,
  buyerUserId: string,
  newStatus: string
): Promise<void> {
  const statusLabels: Record<string, string> = {
    PENDING: "pending confirmation",
    PROCESSING: "being processed",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  const label = statusLabels[newStatus] ?? newStatus.toLowerCase();

  await createNotification({
    userId: buyerUserId,
    type: "ORDER_STATUS_UPDATED",
    message: `Your order #${orderId.slice(-8)} has been ${label}`,
    link: `/my-orders/${orderId}`,
  });
}

/**
 * Notify all admins of a new seller application
 */
export async function notifyAdminsOfNewApplication(
  applicantName: string,
  applicationId: string
): Promise<void> {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "NEW_APPLICATION",
          message: `New seller application from ${applicantName || "a user"}`,
          link: "/admin/applications",
        })
      )
    );
  } catch (err) {
    console.error("Failed to notify admins of new application:", err);
  }
}

/**
 * Notify an applicant of the outcome of their seller application
 */
export async function notifyApplicantOfDecision(
  applicantUserId: string,
  approved: boolean,
  storeName?: string,
  adminNotes?: string
): Promise<void> {
  const message = approved
    ? `Congratulations! Your seller application for "${storeName || "your store"}" has been approved. You can now start selling.`
    : `Your seller application for "${storeName || "your store"}" was not approved. ${adminNotes ? `Reason: ${adminNotes}` : "Please contact support for more information."}`;

  await createNotification({
    userId: applicantUserId,
    type: approved ? "APPLICATION_APPROVED" : "APPLICATION_REJECTED",
    message,
    link: approved ? "/seller" : "/become-seller",
  });
}

/**
 * Notify seller when a new product is created (optional)
 */
export async function notifyProductCreated(
  sellerId: string,
  productName: string
): Promise<void> {
  await createNotification({
    userId: sellerId,
    type: "NEW_PRODUCT",
    message: `Your product "${productName}" has been successfully listed`,
    link: "/seller/products",
  });
}