import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Battle Mode",
  description: "Compare two AI services side-by-side on CapCipCup Market. Same input, different models — see which is faster and better.",
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
