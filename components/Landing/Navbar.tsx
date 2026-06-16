// components/Landing/Navbar.tsx
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serialize";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await getServerSession();

  let userData = null;
  if (session?.user?.id) {
    userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        sellerApplication: {
          select: { status: true },
        },
        store: {
          select: { id: true, slug: true },
        },
      },
    });
  }

  const serializedUser = serializeUser(userData);

  return <NavbarClient prefetchedUser={serializedUser} />;
}