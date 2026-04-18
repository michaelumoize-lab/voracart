// app/(admin)/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import {
  Users,
  ShoppingBag,
  Store,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingApplications: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, isLoading } = useRole();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin, isLoading]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      if (!res.ok) {
        const body = await res.text();
        const message = body ? body : `HTTP ${res.status}`;
        throw new Error(message);
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to load dashboard stats");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard stats";
      setError(message);
      console.error("Failed to fetch dashboard stats:", error);
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
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/users",
    },
    {
      title: "Total Sellers",
      value: stats?.totalSellers ?? 0,
      icon: Store,
      color: "bg-green-500",
      href: "/admin/users?role=seller",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "bg-purple-500",
      href: "/admin/orders",
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications ?? 0,
      icon: Clock,
      color: "bg-orange-500",
      href: "/admin/applications?status=pending",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "bg-indigo-500",
      href: "/admin/products",
    },
    {
      title: "Total Revenue",
      value: `₦${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      href: "/admin/analytics",
    },
  ];

  const orderStats = [
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
    },
    {
      title: "Completed Orders",
      value: stats?.completedOrders ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950/30",
    },
    {
      title: "Monthly Revenue",
      value: `₦${(stats?.monthlyRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your marketplace performance
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {card.title}
                  </p>
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

      {/* Order Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orderStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/applications"
            className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-accent transition"
          >
            <Store className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">
              Review Applications
            </span>
            {(stats?.pendingApplications ?? 0) > 0 && (
              <span className="mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {stats.pendingApplications} pending
              </span>
            )}
          </Link>

          <Link
            href="/admin/users"
            className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-accent transition"
          >
            <Users className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">
              Manage Users
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-accent transition"
          >
            <ShoppingBag className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">
              View All Orders
            </span>
            {(stats?.pendingOrders ?? 0) > 0 && (
              <span className="mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {stats.pendingOrders} pending
              </span>
            )}
          </Link>

          <Link
            href="/admin/messages"
            className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-accent transition"
          >
            <MessageSquare className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">
              Messages
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center py-8">
            Recent activity will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
