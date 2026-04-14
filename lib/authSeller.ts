import { getServerSession } from "./get-session";

const authSeller = async (): Promise<boolean> => {
  try {
    const session = await getServerSession();
    if (!session?.user) return false;
    return (session.user as { role?: string }).role === "seller";
  } catch {
    return false;
  }
};

export default authSeller;
