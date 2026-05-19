import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Real-time marketplace analytics for CapCipCup Market — total requests, MUSD volume, success rates, and on-chain metrics.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
