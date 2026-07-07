import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationDetailClient from "./ApplicationDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  const application = await prisma.sellerApplication.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!application) {
    redirect("/admin/applications");
  }

  // Serialize for client
  const serialized = {
    id: application.id,
    storeName: application.storeName,
    description: application.description,
    phone: application.phone,
    status: application.status,
    adminNotes: application.adminNotes,
    reviewedBy: application.reviewedBy,
    reviewedAt: application.reviewedAt?.toISOString() || null,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    user: {
      id: application.user.id,
      name: application.user.name,
      email: application.user.email,
      image: application.user.image,
      role: application.user.role,
      joinedAt: application.user.createdAt.toISOString(),
    },
  };

  return <ApplicationDetailClient application={serialized} />;
}
