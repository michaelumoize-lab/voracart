// app/(dashboard)/my-orders/[id]/OrderDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Star,
} from "lucide-react";
import type { SerializedOrderDetail } from "@/lib/serialize";

interface OrderDetailClientProps {
  initialOrder: SerializedOrderDetail;
}

// Skeleton component for loading state (if needed for future client-side fetching)
function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-24 bg-muted rounded mb-4" />
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-7 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="h-6 w-24 bg-muted rounded mb-3" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="w-[60px] h-[60px] bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
              <div className="h-5 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component to check if a product can be reviewed
function ReviewButton({
  productId,
  orderStatus,
}: {
  productId: string;
  productName: string;
  orderStatus: string;
}) {
  // Only show for delivered orders
  if (orderStatus !== "DELIVERED") {
    return null;
  }

  return (
    <Link
      href={`/products/${productId}/review`}
      className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1"
    >
      <Star className="w-3 h-3" />
      Write a Review
    </Link>
  );
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

// Helper function to get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case "DELIVERED":
      return <Package className="w-4 h-4" />;
    case "SHIPPED":
      return <Truck className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
}

export default function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const [order] = useState(initialOrder);

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Order not found
        </h2>
        <p className="text-muted-foreground mb-6">
          The order you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Payment Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Method:</span>{" "}
                    <span className="text-foreground capitalize">
                      {order.paymentMethod || "Not specified"}
                    </span>
                  </p>
                  {order.paymentReference && (
                    <p>
                      <span className="text-muted-foreground">Reference:</span>{" "}
                      <span className="text-foreground font-mono text-xs">
                        {order.paymentReference}
                      </span>
                    </p>
                  )}
                  {order.notes && (
                    <p>
                      <span className="text-muted-foreground">Notes:</span>{" "}
                      <span className="text-foreground">{order.notes}</span>
                    </p>
                  )}
                  {order.invoiceUrl && (
                    <Link
                      href={order.invoiceUrl}
                      target="_blank"
                      className="text-primary hover:underline text-sm inline-block mt-1"
                    >
                      Download Invoice
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium text-foreground">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.address}
                  </p>
                  <p className="text-muted-foreground">
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No shipping address available
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 flex-1"
                      >
                        {item.productName}
                      </Link>
                      <ReviewButton
                        productId={item.productId}
                        productName={item.productName}
                        orderStatus={order.status}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>
                        Unit Price: ₦{item.unitPrice.toLocaleString()}
                      </span>
                    </div>
                    {item.status !== order.status && (
                      <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-1">
                        Item status: {item.status}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₦{item.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ₦{order.subtotal?.toLocaleString() || "0.00"}
                  </span>
                </div>
                {order.shippingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="text-foreground">
                      ₦{order.shippingFee.toLocaleString()}
                    </span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -₦{order.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    ₦{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}