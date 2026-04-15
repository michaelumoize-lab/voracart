// app/(seller)/seller/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import { LucideIcon } from "lucide-react";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export default function SellerDashboard() {
  const router = useRouter();
  const { isSeller, isLoading } = useRole();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSeller && !isLoading) {
      router.push("/");
    }
  }, [isSeller, isLoading, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/seller/dashboard/stats"),
        fetch("/api/seller/orders?limit=5"), // Changed to use orders API with limit
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setRecentOrders(ordersData.orders);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
      href: "/seller/products",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "bg-green-500",
      href: "/seller/orders",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "bg-orange-500",
      href: "/seller/orders?status=PENDING",
    },
    {
      title: "Total Revenue",
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
      href: "/seller/analytics",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and orders</p>
        </div>
        <Link
          href="/seller/add-product"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="block bg-card border border-border rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Row 2 - Low Stock & Out of Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Products</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats?.lowStockProducts || 0}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-full">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats?.outOfStockProducts || 0}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Revenue Overview</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Chart will appear here</p>
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>This Month: ₦{(stats?.monthlyRevenue || 0).toLocaleString()}</span>
            <span>Total: ₦{(stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold text-foreground mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Rating</span>
              <span className="font-medium text-foreground">
                ★ {stats?.averageRating || 0}/5
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Store Views</span>
              <span className="font-medium text-foreground">Coming soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link
            href="/seller/orders"
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No orders yet
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {order.customerName || "Guest"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    ₦{order.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
                <Link
                  href={`/seller/orders/${order.id}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Eye className="w-3 h-3" />
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          title="Add Product"
          description="List a new item"
          icon={Plus}
          href="/seller/add-product"
        />
        <QuickActionCard
          title="View Products"
          description="Manage inventory"
          icon={Package}
          href="/seller/products"
        />
        <QuickActionCard
          title="Process Orders"
          description="Fulfill customer orders"
          icon={ShoppingBag}
          href="/seller/orders"
        />
        <QuickActionCard
          title="Store Settings"
          description="Update WhatsApp number"
          icon={Settings}
          href="/seller/settings"
        />
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon: Icon, href }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-center p-4 bg-card border border-border rounded-lg hover:shadow-lg transition"
    >
      <div className="p-2 bg-primary/10 rounded-full mb-2">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-medium text-foreground text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}