// app/(dashboard)/layout.tsx
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <Footer />
    </>
  );
}
