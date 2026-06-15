// app/(dashboard)/my-orders/MyOrdersClient.tsx
"use client";

import Link from "next/link";
import { Package, Eye } from "lucide-react";
import type { SerializedOrderList } from "@/lib/serialize";

interface MyOrdersClientProps {
  initialOrders: SerializedOrderList[];
}

// Helper function to get status color
function getStatusColor(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "REFUNDED":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "PROCESSING":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

export default function MyOrdersClient({ initialOrders }: MyOrdersClientProps) {
  const orders = initialOrders;

  // Show empty state if no orders
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No orders yet
        </h1>
        <p className="text-muted-foreground mb-6">
          When you place orders, they&apos;ll appear here.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-block"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm font-medium">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold">
                  ₦{order.totalAmount?.toLocaleString() || "0.00"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <Link
                href={`/my-orders/${order.id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline transition-colors"
              >
                <Eye className="w-4 h-4" /> View Details
              </Link>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
