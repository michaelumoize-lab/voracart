// app/(public)/layout.tsx
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
