"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AppNotification } from "@/types";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  XCircle,
  FileText,
  Bell,
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
  const { data: session } = authClient.useSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch + polling
  useEffect(() => {
    let isMounted = true;

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

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
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

  const handleNotificationClick = async (notification: AppNotification) => {
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (!session?.user) return null;

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
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
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
                className="text-xs text-orange-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 mb-2 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition border-b border-gray-50 dark:border-gray-700 last:border-0 ${
                    !n.read
                      ? "bg-orange-50/60 dark:bg-orange-900/20"
                      : "dark:bg-gray-800"
                  }`}
                >
                  <span className="text-lg mt-0.5 shrink-0">
                    {typeIcon[n.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${!n.read ? "font-medium text-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-orange-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
