import { getServerSession } from "./get-session";

const authAdmin = async (): Promise<boolean> => {
  try {
    const session = await getServerSession();
    if (!session?.user) return false;
    return (session.user as { role?: string }).role === "admin";
  } catch {
    return false;
  }
};

export default authAdmin;
