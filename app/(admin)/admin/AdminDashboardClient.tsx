// app/(admin)/admin/AdminDashboardClient.tsx
"use client";

import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Shared formatter to avoid hydration mismatches
const numberFormat = new Intl.NumberFormat("en-US");

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingApplications: number;
  totalSellers: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customerName: string;
  }>;
}

// Status configuration with valid Badge variants and optional custom classes
const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  PENDING: { variant: "secondary" },
  CONFIRMED: { variant: "default" },
  PROCESSING: { variant: "default" },
  SHIPPED: { variant: "default" },
  DELIVERED: {
    variant: "outline",
    className: "border-green-500 text-green-600",
  },
  CANCELLED: { variant: "destructive" },
  REFUNDED: { variant: "outline" },
};

export default function AdminDashboardClient({ stats }: { stats: Stats }) {
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-purple-500",
    },
    {
      label: "Revenue",
      value: `₦${numberFormat.format(stats.totalRevenue)}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Active Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-amber-500",
    },
    {
      label: "Pending Applications",
      value: stats.pendingApplications,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Sellers",
      value: stats.totalSellers,
      icon: Store,
      color: "text-indigo-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-md bg-muted p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order) => {
                    const config = statusConfig[order.status] || {
                      variant: "outline",
                    };
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id.slice(-8)}
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={config.variant}
                            className={config.className}
                          >
                            {order.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₦{numberFormat.format(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
