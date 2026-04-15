"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientSession } from "@/lib/use-session-client";
import { AppNotification } from "@/types";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  XCircle,
  FileText,
  Bell,
  Mail,
  Check,
} from "lucide-react";

const POLL_INTERVAL = 60_000; // 60 seconds

const typeIcon: Record<string, React.ReactNode> = {
  NEW_ORDER: <ShoppingCart className="w-4 h-4" />,
  ORDER_STATUS_UPDATED: <Package className="w-4 h-4" />,
  APPLICATION_APPROVED: <CheckCircle className="w-4 h-4" />,
  APPLICATION_REJECTED: <XCircle className="w-4 h-4" />,
  NEW_APPLICATION: <FileText className="w-4 h-4" />,
};

export default function NotificationBell() {
  const router = useRouter();
  const { session, isLoading } = useClientSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch + polling
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchNotifications = async () => {
      if (!session?.user) return;
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success && isMounted) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // silently fail
      }
    };

    if (session?.user) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, POLL_INTERVAL);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [session?.user]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    const previousUnreadCount = unreadCount;
    const previousNotifications = notifications;
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      // Optimistically clear badge
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Persist to server
      try {
        const res = await fetch("/api/notifications", { method: "PATCH" });
        if (!res.ok) throw new Error("Failed to mark as read");
      } catch {
        // Revert optimistic update on failure
        setUnreadCount(previousUnreadCount);
        setNotifications(previousNotifications);
      }
    }
  };

  // ✅ Mark individual notification as read
  const markAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent opening the notification link

    if (markingId === notificationId) return;
    setMarkingId(notificationId);

    // Optimistic update
    const wasUnread =
      notifications.find((n) => n.id === notificationId)?.read === false;
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    }

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId }),
      });

      if (!res.ok) throw new Error("Failed to mark as read");
    } catch (error) {
      // Revert optimistic update on failure
      if (wasUnread) {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: false } : n,
          ),
        );
      }
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    // Mark as read when clicking
    if (!notification.read) {
      // Optimistic update
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );

      // Background API call
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      }).catch(console.error);
    }

    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Don't show anything while loading or if no user
  if (isLoading || !session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={async () => {
                  setUnreadCount(0);
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true })),
                  );
                  await fetch("/api/notifications", { method: "PATCH" });
                }}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Mail className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative border-b border-border last:border-0 ${
                    !n.read ? "bg-primary/5" : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 transition"
                  >
                    <span className="text-primary mt-0.5 shrink-0">
                      {typeIcon[n.type] ?? <Bell className="w-4 h-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !n.read
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <button
                          onClick={(e) => markAsRead(e, n.id)}
                          disabled={markingId === n.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-accent"
                          aria-label="Mark as read"
                        >
                          {markingId === n.id ? (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
