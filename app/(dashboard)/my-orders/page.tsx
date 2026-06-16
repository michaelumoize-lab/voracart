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

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: {
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = serializeOrderList(orders);

  return <MyOrdersClient initialOrders={serializedOrders} />;
}
