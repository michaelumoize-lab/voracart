import NavbarClient from "./NavbarClient";
import { getServerSession } from "@/lib/get-session";

export default async function Navbar() {
  const session = await getServerSession();
  return <NavbarClient prefetchedSession={session} />;
}