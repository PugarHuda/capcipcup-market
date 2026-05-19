"use client";

import { useState, useEffect } from "react";
import { tryServiceFree, type InferenceResponse } from "@/lib/api";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ERC20_ABI, MUSD_ADDRESS } from "@/lib/contracts";
import { useToast } from "@/components/ui/Toast";

interface PlaygroundProps {
  serviceId: string;
  priceMusd?: string;
}

const PAYMENT_RECEIVER = process.env.NEXT_PUBLIC_PAYMENT_RECEIVER || "0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb";

const SERVICE_PRICES: Record<string, string> = {
  "1": "0.005",
  "2": "0.005",
  "3": "0.005",
  "4": "0.01",
  "5": "0.008",
  "6": "0.003",
};

export function Playground({ serviceId, priceMusd }: PlaygroundProps) {
  const PRICE_MUSD = priceMusd || SERVICE_PRICES[serviceId] || "0.005";
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  const { writeContract: transferMusd, data: payTxHash, reset: resetTransfer } = useWriteContract();
  const { isSuccess: payConfirmed, isLoading: payConfirming } = useWaitForTransactionReceipt({
    hash: payTxHash,
    query: { enabled: !!payTxHash },
  });

  useEffect(() => {
    if (payConfirmed && payTxHash && paying) {
      toast("Payment confirmed on-chain", "success", payTxHash);
      callPaidEndpoint(payTxHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payConfirmed]);

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
    if (!isConnected || !address || !input.trim()) return;
    setError("");
    setResult(null);
    setPaying(true);
    resetTransfer();

    transferMusd({
      address: MUSD_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [PAYMENT_RECEIVER as `0x${string}`, parseEther(PRICE_MUSD)],
    });
  }

  async function callPaidEndpoint(txHash: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/service/${serviceId}/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, txHash, payer: address }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Payment failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Paid request failed");
    } finally {
      setPaying(false);
      resetTransfer();
    }
  }

  const isProcessing = loading || paying || payConfirming;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Playground</h2>
        <p className="text-zinc-400 mt-1">Try it for free or pay per request with MUSD</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-32 rounded-lg bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A] resize-none"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTryFree}
            disabled={isProcessing || !input.trim()}
            className="px-6 py-2.5 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Try Free"}
          </button>
          <button
            onClick={handlePayAndUse}
            disabled={isProcessing || !input.trim() || !isConnected}
            className="px-6 py-2.5 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {payConfirming ? "Confirming payment..." : paying ? "Processing..." : `Pay ${PRICE_MUSD} MUSD`}
          </button>
        </div>

        {!isConnected && (
          <p className="text-xs text-zinc-500">Connect wallet to use the paid endpoint.</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
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
