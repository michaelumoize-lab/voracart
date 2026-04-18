// app/(dashboard)/my-orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package } from "lucide-react";
import { useClientSession } from "@/lib/use-session-client";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id;
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { session } = useClientSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/my-orders");
      return;
    }
    if (session?.user) fetchOrder();
  }, [session, orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
      else toast.error(data.message || "Order not found");
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  if (!order) return <div className="text-center py-12">Order not found</div>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Order #{order.id.slice(-8)}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
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
          <div>
            <p className="text-sm text-muted-foreground">Order Date</p>
            <p className="text-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Shipping Details</p>
            <p className="text-foreground">{order.shippingName}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingPhone}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-primary">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
        <h2 className="font-semibold text-foreground mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-3 bg-muted/30 rounded-lg"
            >
              <Image
                src={item.image}
                alt={item.productName}
                width={60}
                height={60}
                className="rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
