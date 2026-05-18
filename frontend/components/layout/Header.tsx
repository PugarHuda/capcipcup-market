"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import { ERC20_ABI, MUSD_ADDRESS } from "@/lib/contracts";
import { useToast } from "@/components/ui/Toast";

const MOCK_MEZO_ADDRESS = process.env.NEXT_PUBLIC_MOCK_MEZO_ADDRESS || "";

const MINT_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);

  const { data: musdBalance } = useReadContract({
    address: MUSD_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: mezoBalance } = useReadContract({
    address: MOCK_MEZO_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!MOCK_MEZO_ADDRESS },
  });

  const { writeContract: mintMusd, data: mintMusdTx } = useWriteContract();
  const { writeContract: mintMezo, data: mintMezoTx } = useWriteContract();
  const { isLoading: mintingMusd, isSuccess: musdMinted } = useWaitForTransactionReceipt({ hash: mintMusdTx, query: { enabled: !!mintMusdTx } });
  const { isLoading: mintingMezo, isSuccess: mezoMinted } = useWaitForTransactionReceipt({ hash: mintMezoTx, query: { enabled: !!mintMezoTx } });

  useEffect(() => {
    if (musdMinted) toast("Minted 1000 MUSD to your wallet", "success", mintMusdTx);
  }, [musdMinted]);

  useEffect(() => {
    if (mezoMinted) toast("Minted 1000 MEZO to your wallet", "success", mintMezoTx);
  }, [mezoMinted]);

  function handleFaucetMusd() {
    if (!address) return;
    mintMusd({
      address: MUSD_ADDRESS as `0x${string}`,
      abi: MINT_ABI,
      functionName: "mint",
      args: [address, parseEther("1000")],
    });
  }

  function handleFaucetMezo() {
    if (!address || !MOCK_MEZO_ADDRESS) return;
    mintMezo({
      address: MOCK_MEZO_ADDRESS as `0x${string}`,
      abi: MINT_ABI,
      functionName: "mint",
      args: [address, parseEther("1000")],
    });
  }

  const formatBal = (val: unknown) => {
    if (val === undefined || val === null) return "0";
    const n = Number(formatEther(val as bigint));
    if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

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
            <Link href="/analytics" className="hover:text-zinc-100 transition-colors">
              Analytics
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address && (
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                {formatBal(musdBalance)} MUSD
              </span>
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                {formatBal(mezoBalance)} MEZO
              </span>
              <button
                onClick={handleFaucetMusd}
                disabled={mintingMusd}
                className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800/50 transition-colors disabled:opacity-50"
                title="Mint 1000 MUSD (testnet)"
              >
                {mintingMusd ? "..." : "+MUSD"}
              </button>
              <button
                onClick={handleFaucetMezo}
                disabled={mintingMezo}
                className="px-2 py-1 rounded bg-purple-900/50 text-purple-400 hover:bg-purple-800/50 transition-colors disabled:opacity-50"
                title="Mint 1000 MEZO (testnet)"
              >
                {mintingMezo ? "..." : "+MEZO"}
              </button>
            </div>
          )}

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowConnectors(!showConnectors)}
                className="px-4 py-2 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors"
              >
                Connect Wallet
              </button>
              {showConnectors && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl z-50 overflow-hidden">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => { connect({ connector }); setShowConnectors(false); }}
                      className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                    >
                      {connector.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-3 text-sm text-zinc-400">
            <Link href="/" onClick={() => setMobileOpen(false)} className="hover:text-zinc-100">Explore</Link>
            <Link href="/vault" onClick={() => setMobileOpen(false)} className="hover:text-zinc-100">Agent Vault</Link>
            <Link href="/provider" onClick={() => setMobileOpen(false)} className="hover:text-zinc-100">Provide</Link>
            <Link href="/analytics" onClick={() => setMobileOpen(false)} className="hover:text-zinc-100">Analytics</Link>
          </nav>
          {isConnected && address && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                {formatBal(musdBalance)} MUSD
              </span>
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                {formatBal(mezoBalance)} MEZO
              </span>
              <button
                onClick={handleFaucetMusd}
                disabled={mintingMusd}
                className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 text-xs disabled:opacity-50"
              >
                {mintingMusd ? "..." : "+MUSD"}
              </button>
              <button
                onClick={handleFaucetMezo}
                disabled={mintingMezo}
                className="px-2 py-1 rounded bg-purple-900/50 text-purple-400 text-xs disabled:opacity-50"
              >
                {mintingMezo ? "..." : "+MEZO"}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
