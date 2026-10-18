import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer, BottomCartBar } from "@/components/storefront/CartDrawer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "GB Retail Online — Groceries from stores you trust",
  description:
    "Order online from your local GB Retail shop. Same inventory as the counter — order ahead, pick up in store, pay UPI or cash.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Header />
        <main className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 sm:px-4 sm:pt-6 md:pb-10">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <BottomCartBar />
        <Toaster />
      </body>
    </html>
  );
}
