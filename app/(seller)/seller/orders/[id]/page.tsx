//app/(seller)/seller/orders/[id]/page.tsx
// app/(seller)/seller/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import { Loader2, ArrowLeft, Package, User, Calendar, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  PROCESSING: "bg-blue-500/10 text-blue-600",
  SHIPPED: "bg-purple-500/10 text-purple-600",
  DELIVERED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-red-500/10 text-red-600",
};

const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isSeller, isLoading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!roleLoading && !isSeller) {
      router.push("/");
    }
  }, [isSeller, roleLoading, router]);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/seller/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error("Order not found");
        router.push("/seller/orders");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/seller/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-muted transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order #{order.id.slice(-8)}</h1>
          <p className="text-muted-foreground mt-1">View and manage order details</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Order Info Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
                className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-primary ${statusColors[order.status]} disabled:opacity-50`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <p className="text-sm text-foreground">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Order Summary
              </h3>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold text-primary">₦{order.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Order Items ({order.items.length})
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                <Image
                  src={item.image}
                  alt={item.productName}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.productName}</h3>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">₦{item.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Subtotal: ₦{item.subtotal.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}