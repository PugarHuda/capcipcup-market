import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provider Dashboard",
  description: "Register and manage your AI services on CapCipCup Market. Stake MEZO to list services and earn MUSD per request.",
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
