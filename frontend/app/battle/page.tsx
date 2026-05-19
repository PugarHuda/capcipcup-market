"use client";

import { useState, useEffect } from "react";
import { fetchServices, type ServiceListItem } from "@/lib/api";
import { useAccount } from "wagmi";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface BattleResult {
  serviceId: string;
  name: string;
  output: string;
  model: string;
  responseTimeMs: number;
}

export default function BattlePage() {
  const { address } = useAccount();
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [left, setLeft] = useState("1");
  const [right, setRight] = useState("2");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<[BattleResult | null, BattleResult | null]>([null, null]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices().then(setServices).catch(console.error);
  }, []);

  async function callService(serviceId: string): Promise<BattleResult | null> {
    const headers: Record<string, string> = {};
    if (address) headers["x-wallet-address"] = address;

    const res = await fetch(
      `${BACKEND_URL}/api/service/${serviceId}/try?input=${encodeURIComponent(input.slice(0, 5000))}`,
      { headers }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        throw new Error(`Free tier exhausted for ${services.find(s => s.id === serviceId)?.name || serviceId}. Connect wallet or try another service.`);
      }
      if (res.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      throw new Error(data.error || `Service ${serviceId} failed`);
    }

    const data = await res.json();
    const svc = services.find((s) => s.id === serviceId);
    return {
      serviceId,
      name: svc?.name || `Service #${serviceId}`,
      output: data.output,
      model: data.model,
      responseTimeMs: data.responseTimeMs,
    };
  }

  async function handleBattle() {
    if (!input.trim() || left === right) return;
    setLoading(true);
    setError("");
    setResults([null, null]);

    try {
      const [leftResult, rightResult] = await Promise.all([
        callService(left),
        callService(right),
      ]);
      setResults([leftResult, rightResult]);
    } catch (err: any) {
      setError(err.message || "Battle failed");
    } finally {
      setLoading(false);
    }
  }

  const winner = results[0] && results[1]
    ? results[0].responseTimeMs < results[1].responseTimeMs ? 0 : 1
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Battle Mode</h1>
        <p className="text-zinc-400 mt-2">
          Compare two AI services side-by-side with the same input. See which is faster and better.
        </p>
      </div>

      {/* Service Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Challenger A</label>
          <select
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 focus:outline-none focus:border-[#F7931A]"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.model})</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Challenger B</label>
          <select
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 focus:outline-none focus:border-[#F7931A]"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.model})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter the same input text for both services..."
          className="w-full h-28 rounded-lg bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A] resize-none"
        />
        <button
          onClick={handleBattle}
          disabled={loading || !input.trim() || left === right}
          className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#F7931A] text-black font-medium hover:bg-[#F7931A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Battling..." : "Start Battle"}
        </button>
        {left === right && (
          <p className="text-xs text-yellow-400">Select two different services to compare.</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {(results[0] || results[1]) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-5 space-y-3 ${
                winner === i
                  ? "border-emerald-700 bg-emerald-950/20"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              {r ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{r.name}</h3>
                    {winner === i && (
                      <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-xs font-medium">
                        Faster
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{r.model}</span>
                    <span className={`font-medium ${winner === i ? "text-emerald-400" : "text-zinc-300"}`}>
                      {r.responseTimeMs}ms
                    </span>
                  </div>
                  <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed border-t border-zinc-800 pt-3 max-h-64 overflow-y-auto">
                    {r.output}
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-zinc-600">
                  Waiting...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results[0] && results[1] && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-center text-sm text-zinc-400">
          Speed difference:{" "}
          <span className="text-[#F7931A] font-medium">
            {Math.abs(results[0].responseTimeMs - results[1].responseTimeMs)}ms
          </span>
          {" "}— Both used free tier (connects to same wallet for limit tracking)
        </div>
      )}
    </div>
  );
}
