// app/(admin)/admin/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch stats in parallel
  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    totalProducts,
    pendingApplications,
    totalSellers,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.sellerApplication.count({ where: { status: "PENDING" } }),
    prisma.store.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1 },
      },
    }),
  ]);

  const stats = {
    totalUsers,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
    totalProducts,
    pendingApplications,
    totalSellers,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      customerName: order.user?.name || "Unknown",
    })),
  };

  return <AdminDashboardClient stats={stats} />;
}
