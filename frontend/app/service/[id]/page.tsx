"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Playground } from "@/components/services/Playground";
import { ReviewSection } from "@/components/services/ReviewSection";
import { fetchMetrics } from "@/lib/api";

const SERVICE_META: Record<string, { name: string; description: string; model: string }> = {
  "1": {
    name: "Text Summarizer",
    description: "Condenses long text into 2-3 key sentences using GPT-OSS 120B.",
    model: "openai/gpt-oss-120b:free",
  },
  "2": {
    name: "Sentiment Analyzer",
    description: "Detects positive, negative, or neutral sentiment with confidence scoring.",
    model: "openai/gpt-oss-120b:free",
  },
  "3": {
    name: "Code Explainer",
    description: "Explains what code does in plain English using GPT-OSS 120B.",
    model: "openai/gpt-oss-120b:free",
  },
};

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const meta = SERVICE_META[id] || { name: `Service #${id}`, description: "", model: "unknown" };
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchMetrics(id).then(setMetrics).catch(() => {});
  }, [id]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{meta.name}</h1>
        <p className="text-zinc-400">{meta.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{meta.model}</span>
          <span className="text-[#F7931A] font-medium">$0.005 MUSD/request</span>
          <span>3 free tries</span>
        </div>
      </div>

      {metrics && metrics.totalRequests > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-500">Total Requests</p>
            <p className="text-lg font-semibold">{metrics.totalRequests}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-500">Success Rate</p>
            <p className="text-lg font-semibold text-emerald-400">{metrics.successRate}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-500">Avg Response</p>
            <p className="text-lg font-semibold">{metrics.avgResponseTimeMs}ms</p>
          </div>
        </div>
      )}

      <Playground serviceId={id} />

      <div className="border-t border-zinc-800 pt-8">
        <ReviewSection serviceId={id} />
      </div>
    </div>
  );
}
