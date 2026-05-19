"use client";

import Link from "next/link";

interface ServiceCardProps {
  id: string;
  name: string;
  model: string;
  priceMusd: string;
  freeTierLimit: number;
  metrics: {
    totalRequests: number;
    successRate: string;
    avgResponseTimeMs: number;
  };
}

export function ServiceCard({ id, name, model, priceMusd, freeTierLimit, metrics }: ServiceCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors group">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold group-hover:text-[#F7931A] transition-colors">
            {name}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">Model: {model}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#F7931A] font-medium">{priceMusd} MUSD</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">{metrics.avgResponseTimeMs}ms avg</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400">{metrics.successRate}</span>
        </div>

        {freeTierLimit > 0 && (
          <p className="text-xs text-zinc-500">
            {freeTierLimit} free requests available
          </p>
        )}

        <div className="pt-2">
          <Link
            href={`/service/${id}`}
            className="block w-full text-center px-4 py-2.5 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors"
          >
            Try Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
