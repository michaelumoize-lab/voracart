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
    where: { id, userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: { take: 1, select: { url: true } },
              store: { select: { id: true, name: true } },
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
      coupon: { select: { id: true, code: true, type: true, value: true } },
    },
  });

  if (!order) {
    redirect("/my-orders");
  }

  const serializedOrder = serializeOrderDetail(order);
  return <OrderDetailClient initialOrder={serializedOrder} />;
}
