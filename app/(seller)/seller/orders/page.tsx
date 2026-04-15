//app/(seller)/seller/products/page.tsx
// app/(seller)/seller/orders/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import { Loader2, Eye, Package, Calendar, DollarSign, Search, Filter } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Order {
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  total: number;
  itemCount: number;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  PROCESSING: "bg-blue-500/10 text-blue-600",
  SHIPPED: "bg-purple-500/10 text-purple-600",
  DELIVERED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-red-500/10 text-red-600",
};

const statusOptions = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function SellerOrdersPage() {
  const router = useRouter();
  const { isSeller, isLoading: roleLoading } = useRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!roleLoading && !isSeller) {
      router.push("/");
    }
  }, [isSeller, roleLoading, router]);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const res = await fetch(`/api/seller/orders?${params}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and track customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-left">
                  <th className="p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-mono text-sm text-foreground">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="p-4 text-foreground">{order.customerName}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-foreground">{order.itemCount}</td>
                    <td className="p-4 font-medium text-foreground">
                      ₦{order.total.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/seller/orders/${order.id}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}