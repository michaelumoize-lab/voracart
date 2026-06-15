// app/(cart)/cart/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeSettings } from "@/lib/serialize";
import CartClient from "./CartClient";

// Fetch settings on the server
async function getSettings() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });
  return serializeSettings(settings);
}

export default async function CartPage() {
  const session = await getServerSession();

  // Redirect if not authenticated (middleware also protects, but this is a safety net)
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/cart");
  }

  // Fetch settings on server (no client API call needed)
  const settings = await getSettings();

  return <CartClient initialSettings={settings} />;
}
