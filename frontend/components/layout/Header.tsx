"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            <span className="text-[#F7931A]">Cap</span>
            <span className="text-zinc-100">Cip</span>
            <span className="text-[#F7931A]">Cup</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-zinc-100 transition-colors">
              Explore
            </Link>
            <Link href="/vault" className="hover:text-zinc-100 transition-colors">
              Agent Vault
            </Link>
            <Link href="/provider" className="hover:text-zinc-100 transition-colors">
              Provide
            </Link>
          </nav>
        </div>

        <div>
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-4 py-2 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
