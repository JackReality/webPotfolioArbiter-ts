import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Portfolio Arbiter",
  description: "La Google Sheet qui vous accompagne dans la gestion de votre portefeuille d'investissement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("dark font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <NavMenu />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
