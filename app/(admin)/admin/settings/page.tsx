// app/(admin)/admin/settings/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeSettings } from "@/lib/serialize";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  const serializedSettings = settings
    ? serializeSettings(settings)! // ← non-null assertion
    : {
        id: 1,
        siteName: "VoraCart",
        siteDescription: null,
        contactEmail: "admin@example.com",
        contactPhone: null,
        maintenanceMode: false,
        allowNewRegistrations: true,
        maxOrderAmount: 1000000,
        currency: "NGN",
        currencySymbol: "₦",
        shippingFee: 0,
        freeShippingThreshold: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

  return <AdminSettingsClient initialSettings={serializedSettings} />;
}
