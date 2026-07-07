// app/(dashboard)/my-orders/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeOrderList } from "@/lib/serialize";
import MyOrdersClient from "./MyOrdersClient";

export default async function MyOrdersPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/my-orders");
  }

  const userId = session.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, // ✅ required
              name: true,
              images: {
                take: 1,
                select: { url: true },
              },
              store: {
                // ✅ required
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const serializedOrders = serializeOrderList(orders);
  return <MyOrdersClient initialOrders={serializedOrders} />;
}
