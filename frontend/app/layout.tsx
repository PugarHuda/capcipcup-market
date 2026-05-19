import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CapCipCup Market — AI Inference Marketplace on Mezo",
    template: "%s | CapCipCup Market",
  },
  description: "Pay-per-request AI services with Bitcoin-backed MUSD micropayments on Mezo. Zero gas. No subscriptions. Try free, then pay only for what you use.",
  keywords: ["AI marketplace", "MUSD", "Mezo", "Bitcoin", "micropayments", "x402", "inference", "DeFi"],
  openGraph: {
    title: "CapCipCup Market — AI Inference Marketplace on Mezo",
    description: "Pay-per-request AI services with Bitcoin-backed MUSD. Zero gas. No subscriptions.",
    siteName: "CapCipCup Market",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CapCipCup Market",
    description: "AI Inference Marketplace — Pay per request with Bitcoin-backed MUSD",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-8 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
