import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminApplicationsClient from "./AdminApplicationsClient";

export default async function AdminApplicationsPage() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const applications = await prisma.sellerApplication.findMany({
    where: { status: "PENDING" }, // only pending, but can add filter
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = applications.map((app) => ({
    id: app.id,
    storeName: app.storeName,
    description: app.description,
    phone: app.phone,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    userName: app.user?.name || "Unknown",
    userEmail: app.user?.email || "",
  }));

  return <AdminApplicationsClient applications={serialized} />;
}
