"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, SERVICE_REGISTRY_ABI } from "@/lib/contracts";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface Stats {
  totalServices: number;
  totalRequests: number;
  successRate: string;
  avgResponseTimeMs: number;
  totalPaidRequests: number;
  totalMusdVolume: string;
  network: string;
  uptime: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const registryAddress = CONTRACT_ADDRESSES.serviceRegistry as `0x${string}`;

  const { data: serviceCount } = useReadContract({
    address: registryAddress,
    abi: SERVICE_REGISTRY_ABI,
    functionName: "serviceCount",
    query: { enabled: !!registryAddress },
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Marketplace Analytics</h1>
        <p className="text-zinc-400 mt-2">Real-time statistics for the CapCipCup marketplace.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="On-Chain Services"
              value={serviceCount ? Number(serviceCount).toString() : "0"}
              sub="Registered via ServiceRegistry"
              color="text-[#F7931A]"
            />
            <StatCard
              label="API Services"
              value={stats?.totalServices.toString() || "0"}
              sub="Active in proxy"
              color="text-zinc-100"
            />
            <StatCard
              label="Total Requests"
              value={stats?.totalRequests.toString() || "0"}
              sub="Free + paid"
              color="text-zinc-100"
            />
            <StatCard
              label="Success Rate"
              value={stats?.successRate || "N/A"}
              sub="Across all services"
              color="text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Paid Requests"
              value={stats?.totalPaidRequests.toString() || "0"}
              sub="MUSD payments verified"
              color="text-[#F7931A]"
            />
            <StatCard
              label="MUSD Volume"
              value={`$${stats?.totalMusdVolume || "0"}`}
              sub="Total earnings"
              color="text-[#F7931A]"
            />
            <StatCard
              label="Avg Response"
              value={`${stats?.avgResponseTimeMs || 0}ms`}
              sub="AI inference latency"
              color="text-zinc-100"
            />
            <StatCard
              label="Network"
              value="Mezo Testnet"
              sub="Chain ID 31611"
              color="text-purple-400"
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
            <h2 className="text-lg font-semibold">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-400">
              <div className="space-y-2">
                <p className="text-[#F7931A] font-medium">Providers</p>
                <p>Stake MEZO tokens to register AI services. Earn MUSD per request. Higher stake = higher trust signal.</p>
              </div>
              <div className="space-y-2">
                <p className="text-emerald-400 font-medium">Consumers</p>
                <p>Try services free (3 requests), then pay 0.005 MUSD per request. Zero gas via x402 protocol.</p>
              </div>
              <div className="space-y-2">
                <p className="text-purple-400 font-medium">AI Agents</p>
                <p>Deposit MUSD in AgentVault, set daily limits, auto-pay for services autonomously.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}
