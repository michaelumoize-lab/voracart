// app/(dashboard)/my-orders/[id]/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeOrderDetail } from "@/lib/serialize";
import OrderDetailClient from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/my-orders");
  }

  const { id } = await params;
  const userId = session.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id: id,
      userId: userId,
    },
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
      shippingAddress: true,
    },
  });

  if (!order) {
    redirect("/my-orders");
  }

  const serializedOrder = serializeOrderDetail(order);

  return <OrderDetailClient initialOrder={serializedOrder} />;
}
