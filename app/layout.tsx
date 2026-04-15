import type { Metadata } from "next";
import { Oxanium, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/contexts/CartContext";

const fontSans = Oxanium({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});
export const metadata: Metadata = {
  title: "VoraCart",
  description: "Your one-stop shop for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", fontSans.variable, fontSerif.variable, fontMono.variable)}
    >
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
          />
          <CartProvider>
          {children}
          </CartProvider> 
        </ThemeProvider>
      </body>
    </html>
  );
}
