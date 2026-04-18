// app/(seller)/seller/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import { Loader2, ArrowLeft, Package, User, Calendar, DollarSign, RefreshCw } from "lucide-react";
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
  itemStatus: string; // ✅ Added itemStatus field
}

interface Order {
  id: string;
  customerName: string;
  customerEmail?: string; // ✅ Made optional - only for admins
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

const itemStatusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// Placeholder image for fallback
const PLACEHOLDER_IMAGE = "/images/product-placeholder.png";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isSeller, isAdmin, isLoading: roleLoading } = useRole(); // ✅ Added isAdmin
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null); // ✅ Track which item is updating
  const [order, setOrder] = useState<Order | null>(null);

  // Validate and get order ID
  const getOrderId = useCallback((): string | null => {
    const id = params?.id;
    if (typeof id === 'string' && id.trim().length > 0) {
      return id;
    }
    return null;
  }, [params?.id]);

  const fetchOrder = useCallback(async () => {
    const orderId = getOrderId();
    if (!orderId) {
      toast.error("Invalid order ID");
      setLoading(false);
      setFetchError(true);
      return;
    }

    setLoading(true);
    setFetchError(false);
    
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        throw new Error(data.message || "Order not found");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load order");
      setFetchError(true);
    }
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order");
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [getOrderId]);

  useEffect(() => {
    if (!roleLoading && !isSeller && !isAdmin) {
      router.push("/");
    }
  }, [isSeller, isAdmin, roleLoading, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ✅ Only admins can update overall order status
  const updateOrderStatus = async (newStatus: string) => {
    if (!isAdmin) {
      toast.error("Only admins can update overall order status");
      return;
    }

    const orderId = getOrderId();
    if (!orderId) {
      toast.error("Invalid order ID");
      return;
    }

    setUpdatingItem(null); // Not using this for order update
    
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
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
    }
  };

  // ✅ Sellers update individual item status via PATCH
  const updateItemStatus = async (itemId: string, newStatus: string) => {
    const orderId = getOrderId();
    if (!orderId) {
      toast.error("Invalid order ID");
      return;
    }

    setUpdatingItem(itemId);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Item status updated to ${newStatus}`);
        setOrder((prev) => prev ? {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, itemStatus: newStatus } : item
          ),
        } : null);
      } else {
        toast.error(data.message || "Failed to update item status");
      }
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdatingItem(null);
    }
  };

  // Get safe image source with fallback
  const getSafeImageSrc = (imageSrc: string | undefined | null): string => {
    if (!imageSrc || typeof imageSrc !== 'string' || imageSrc.trim() === '') {
      return PLACEHOLDER_IMAGE;
    }
    return imageSrc;
  };

  // Show loading state
  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state with retry button
  if (fetchError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Failed to load order details</p>
          <button
            onClick={fetchOrder}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            {/* ✅ Only show order status update for admins */}
            {isAdmin && (
              <div className="flex items-center gap-3">
                <select
                  aria-label="Overall order status"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-primary ${statusColors[order.status]}`}
                >
                  {itemStatusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}
            {/* ✅ Show order status badge for sellers (read-only) */}
            {!isAdmin && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                Order Status: {order.status}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <p className="text-sm text-foreground">{order.customerName}</p>
              {/* ✅ Only show email to admins */}
              {isAdmin && order.customerEmail && (
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              )}
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
                  src={getSafeImageSrc(item.image)}
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
                {/* ✅ Sellers can update individual item status */}
                <div>
                  <select
                    aria-label={`Item status for ${item.productName}`}
                    value={item.itemStatus || "PENDING"}
                    onChange={(e) => updateItemStatus(item.id, e.target.value)}
                    disabled={updatingItem === item.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary ${statusColors[item.itemStatus || "PENDING"]} disabled:opacity-50`}
                  >
                    {itemStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {updatingItem === item.id && (
                    <Loader2 className="w-3 h-3 animate-spin ml-1 inline" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}