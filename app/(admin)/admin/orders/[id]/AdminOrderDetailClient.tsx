// app/(admin)/admin/orders/[id]/AdminOrderDetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Store,
} from "lucide-react";
import type { SerializedOrderDetail } from "@/lib/serialize";

interface AdminOrderDetailClientProps {
  initialOrder: SerializedOrderDetail;
}

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  SHIPPED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  DELIVERED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

// StatusBadge component - moved outside render
const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
};

export default function AdminOrderDetailClient({
  initialOrder,
}: AdminOrderDetailClientProps) {
  const router = useRouter();
  const order = initialOrder;

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Order not found
        </h2>
        <p className="text-muted-foreground mb-6">
          The order you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/admin/orders"
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
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <div className="flex flex-wrap justify-between items-start gap-4">
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
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6">
          {/* Customer & Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Customer Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Customer
              </h3>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {order.user?.name || "Unknown Customer"}
                </p>
                <p className="text-muted-foreground">{order.user?.email}</p>
                {order.user?.role && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {order.user.role}
                  </span>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Payment Information
              </h3>
              <div className="text-sm space-y-1">
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
                {order.paidAt && (
                  <p>
                    <span className="text-muted-foreground">Paid at:</span>{" "}
                    <span className="text-foreground">
                      {new Date(order.paidAt).toLocaleString()}
                    </span>
                  </p>
                )}
                {order.notes && (
                  <p className="mt-2">
                    <span className="text-muted-foreground">Notes:</span>{" "}
                    <span className="text-foreground">{order.notes}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
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
                  <p className="text-muted-foreground">
                    Phone: {order.shippingAddress.phone}
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
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.productName}
                      </Link>
                      {/* Show which store/seller this item belongs to */}
                      {item.product?.store && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <Store className="w-3 h-3" />
                          {item.product.store.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>Unit: ₦{item.unitPrice.toLocaleString()}</span>
                      <span>Item Status: {item.status}</span>
                    </div>
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

          {/* Coupon Info */}
          {order.coupon && (
            <div className="mb-4 p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Coupon Applied:</span>
                <span className="font-mono font-semibold text-foreground">
                  {order.coupon.code}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  Discount: ₦{order.discountAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

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

          {/* Admin Footer */}
          <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Order ID: {order.id}
            </div>
            <div className="flex items-center gap-4">
              {order.invoiceUrl && (
                <Link
                  href={order.invoiceUrl}
                  target="_blank"
                  className="text-sm text-primary hover:underline"
                  rel="noopener noreferrer"
                >
                  Download Invoice
                </Link>
              )}
              <span className="text-xs text-muted-foreground">
                Status managed by seller
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
