// app/(admin)/admin/orders/[id]/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeOrderDetail } from "@/lib/serialize";
import AdminOrderDetailClient from "./AdminOrderDetailClient";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id: id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                take: 1,
                select: { url: true },
              },
              store: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      coupon: true,
    },
  });

  if (!order) {
    redirect("/admin/orders");
  }

  const serializedOrder = serializeOrderDetail(order);

  return <AdminOrderDetailClient initialOrder={serializedOrder} />;
}
