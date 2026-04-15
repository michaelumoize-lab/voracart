// components/Navbar/Navbar.tsx
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import type { Session } from "@/lib/auth";

export default async function Navbar() {
  const session: Session | null = await getServerSession();
  const user = session?.user ?? null;

  let role = "buyer";
  let hasPendingApplication = false;

  if (user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        role: true,
        sellerApplication: {
          select: { status: true }
        }
      },
    });
    role = dbUser?.role ?? "buyer";
    
    // Check if user has a pending seller application
    if (dbUser?.sellerApplication?.status === "PENDING") {
      hasPendingApplication = true;
    }
  }

  const isSeller = role === "seller";
  const isAdmin = role === "admin";

  return (
    <NavbarClient
      session={session}
      role={role}
      isSeller={isSeller}
      isAdmin={isAdmin}
      hasPendingApplication={hasPendingApplication}
    />
  );
}