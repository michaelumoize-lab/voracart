import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      shippingAddress: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    customerName: order.user?.name || "Unknown",
    customerEmail: order.user?.email || "",
    itemCount: order._count.items,
  }));
  return <AdminOrdersClient orders={serialized} />;
}
