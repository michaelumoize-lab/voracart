// app/become-seller/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BecomeSellerClient from "./BecomeSellerClient";

export default async function BecomeSellerPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/become-seller");
  }

  const userId = session.user.id;

  // Already a seller? → redirect
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });
  if (user?.role === "seller") {
    redirect("/seller");
  }

  // Fetch existing application
  const application = await prisma.sellerApplication.findUnique({
    where: { userId },
    select: {
      status: true,
      storeName: true,
      description: true,
      phone: true,
    },
  });

  const serializedApplication = application
    ? {
        status: application.status,
        storeName: application.storeName,
        description: application.description,
        phone: application.phone,
      }
    : null;

  return (
    <BecomeSellerClient
      initialApplication={serializedApplication}
      userName={user?.name}
    />
  );
}
