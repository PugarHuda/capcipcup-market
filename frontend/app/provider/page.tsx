"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES, SERVICE_REGISTRY_ABI, ERC20_ABI } from "@/lib/contracts";

const MOCK_MEZO_ADDRESS = process.env.NEXT_PUBLIC_MOCK_MEZO_ADDRESS || "";

export default function ProviderPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Register as Provider</h1>
        <p className="text-zinc-400">
          Stake MEZO to list your AI service on the marketplace.
        </p>
        <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
          Connect your wallet to register a service.
        </div>
      </div>
    );
  }

  return <RegisterForm />;
}

function RegisterForm() {
  const registryAddress = CONTRACT_ADDRESSES.serviceRegistry as `0x${string}`;

  const [form, setForm] = useState({
    name: "",
    endpoint: "",
    price: "0.005",
    metadataURI: "",
    freeTierLimit: "3",
    stakeAmount: "100",
  });

  const { writeContract: approveToken, data: approveTx } = useWriteContract();
  const { writeContract: registerService, data: registerTx } = useWriteContract();
  const [step, setStep] = useState<"form" | "approving" | "registering" | "done">("form");

  const { isLoading: approving } = useWaitForTransactionReceipt({
    hash: approveTx,
    query: { enabled: !!approveTx },
  });

  const { isLoading: registering, isSuccess } = useWaitForTransactionReceipt({
    hash: registerTx,
    query: { enabled: !!registerTx },
  });

  if (isSuccess && step !== "done") {
    setStep("done");
  }

  function handleApprove() {
    if (!registryAddress || !MOCK_MEZO_ADDRESS) return;
    setStep("approving");
    approveToken({
      address: MOCK_MEZO_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [registryAddress, parseEther(form.stakeAmount)],
    });
  }

  function handleRegister() {
    if (!registryAddress) return;
    setStep("registering");
    registerService({
      address: registryAddress,
      abi: SERVICE_REGISTRY_ABI,
      functionName: "register",
      args: [
        form.name,
        form.endpoint,
        parseEther(form.price),
        form.metadataURI,
        BigInt(form.freeTierLimit),
        parseEther(form.stakeAmount),
      ],
    });
  }

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (step === "done") {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Service Registered!</h1>
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-6 text-center">
          <p className="text-emerald-400 text-lg font-medium">
            Your service "{form.name}" is now live on CapCipCup.
          </p>
          <p className="text-zinc-500 mt-2 text-sm">
            Staked {form.stakeAmount} MEZO. Users can now discover and pay for your service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Register as Provider</h1>
        <p className="text-zinc-400 mt-2">
          Stake MEZO to list your AI service. Users pay per request with MUSD.
        </p>
      </div>

      {(!registryAddress || !MOCK_MEZO_ADDRESS) && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-950/30 p-4 text-sm text-yellow-400">
          Contracts not deployed yet. Set NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS and NEXT_PUBLIC_MOCK_MEZO_ADDRESS.
        </div>
      )}

      <div className="space-y-5">
        <Field label="Service Name" value={form.name} onChange={(v) => update("name", v)} placeholder="e.g. Text Summarizer" />
        <Field label="API Endpoint" value={form.endpoint} onChange={(v) => update("endpoint", v)} placeholder="https://your-api.com/summarize" />
        <Field label="Price per Request (MUSD)" value={form.price} onChange={(v) => update("price", v)} placeholder="0.005" />
        <Field label="Metadata URI (optional)" value={form.metadataURI} onChange={(v) => update("metadataURI", v)} placeholder="ipfs://... or https://..." />
        <Field label="Free Tier Limit" value={form.freeTierLimit} onChange={(v) => update("freeTierLimit", v)} placeholder="3" />
        <Field label="MEZO Stake Amount" value={form.stakeAmount} onChange={(v) => update("stakeAmount", v)} placeholder="100" />
      </div>

      <div className="flex gap-3">
        {step === "form" && (
          <button
            onClick={handleApprove}
            disabled={!form.name || !form.endpoint || !registryAddress}
            className="px-6 py-2.5 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors disabled:opacity-50"
          >
            Approve MEZO & Register
          </button>
        )}
        {step === "approving" && !approving && approveTx && (
          <button
            onClick={handleRegister}
            disabled={registering}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            Confirm Registration
          </button>
        )}
        {(approving || registering) && (
          <p className="text-sm text-zinc-500 self-center">
            {approving ? "Approving MEZO token..." : "Registering service on-chain..."}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A]"
      />
    </div>
  );
}
