// app/(cart)/layout.tsx
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">{children}</main>
      <Footer />
    </>
  );
}
