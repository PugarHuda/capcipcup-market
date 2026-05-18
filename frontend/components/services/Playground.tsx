"use client";

import { useState } from "react";
import { tryServiceFree, type InferenceResponse } from "@/lib/api";
import { useAccount } from "wagmi";

interface PlaygroundProps {
  serviceId: string;
}

export function Playground({ serviceId }: PlaygroundProps) {
  const { address } = useAccount();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  async function handleTryFree() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await tryServiceFree(serviceId, input, address);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handlePayAndUse() {
    const url = `${BACKEND_URL}/api/service/${serviceId}?input=${encodeURIComponent(input)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Service #{serviceId} Playground</h2>
        <p className="text-zinc-400 mt-1">Try it for free or pay per request with MUSD</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-32 rounded-lg bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A] resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={handleTryFree}
            disabled={loading || !input.trim()}
            className="px-6 py-2.5 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Try Free"}
          </button>
          <button
            onClick={handlePayAndUse}
            disabled={!input.trim()}
            className="px-6 py-2.5 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pay $0.005 MUSD
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>Model: {result.model}</span>
            <span>|</span>
            <span>{result.responseTimeMs}ms</span>
            <span>|</span>
            <span className="text-emerald-400">Paid with: {result.paidWith}</span>
          </div>
          <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {result.output}
          </div>
        </div>
      )}
    </div>
  );
}
