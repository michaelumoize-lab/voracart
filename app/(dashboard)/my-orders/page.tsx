// app/(dashboard)/my-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Eye } from "lucide-react";
import { useClientSession } from "@/lib/use-session-client";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const { session } = useClientSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/my-orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      else toast.error(data.message || "Failed to load orders");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No orders yet
        </h1>
        <p className="text-muted-foreground mb-6">
          When you place orders, they'll appear here.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">#{order.id.slice(-8)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold">
                  ${order.totalAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <Link
                href={`/my-orders/${order.id}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Eye className="w-4 h-4" /> View Details
              </Link>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Items: {order.items.length}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
