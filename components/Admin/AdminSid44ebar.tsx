// components/Admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ShoppingBag, Store, Settings, LogOut, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Applications", path: "/admin/applications", icon: Store },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Messages", path: "/admin/messages", icon: MessageSquare },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo - Click to go home */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">VoraCart</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}