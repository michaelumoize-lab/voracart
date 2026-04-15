// components/Navbar/Navbar.tsx
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import type { Session } from "@/lib/auth"; 

export default async function Navbar() {
  const session: Session | null = await getServerSession();
  const user = session?.user ?? null;

  let role = "buyer";

  if (user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    role = dbUser?.role ?? "buyer";
  }

  return (
    <NavbarClient
      session={session}
      role={role}
      isSeller={role === "seller"}
    />
  );
}