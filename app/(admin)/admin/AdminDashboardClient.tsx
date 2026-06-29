// app/admin/AdminDashboardClient.tsx
"use client";

import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  Store,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      value: `₦${stats.totalRevenue.toLocaleString()}`,
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
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 text-sm"
                >
                  <div>
                    <p className="font-medium">#{order.id.slice(-8)}</p>
                    <p className="text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {order.status}
                    </span>
                  </div>
                  <div className="font-medium">
                    ₦{order.totalAmount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
