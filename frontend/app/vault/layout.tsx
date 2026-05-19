import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Vault",
  description: "Deposit MUSD and let your AI agents spend autonomously within daily limits on CapCipCup Market.",
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
