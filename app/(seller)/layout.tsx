// app/(seller)/layout.tsx
import SellerSidebar from "@/components/Admin/AdminSidebar";
import SellerHeader from "@/components/Admin/AdminHeader";

export default function SellerLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SellerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SellerHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
