// app/(dashboard)/my-addresses/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeAddressList } from "@/lib/serialize"; // ← Use the list version
import MyAddressesClient from "./MyAddressesClient";

export default async function MyAddressesPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/my-addresses");
  }

  const addresses = await prisma.shippingAddress.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <MyAddressesClient initialAddresses={serializeAddressList(addresses)} />
  );
}
