// app/(dashboard)/checkout/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeAddressList, serializeSettings } from "@/lib/serialize";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/checkout");
  }

  const [addresses, settings] = await Promise.all([
    prisma.shippingAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    prisma.systemSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <CheckoutClient
      userId={session.user.id}
      initialAddresses={serializeAddressList(addresses)}
      initialSettings={serializeSettings(settings)}
    />
  );
}
