"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESSES, SERVICE_REGISTRY_ABI, ERC20_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/Toast";

const MOCK_MEZO_ADDRESS = process.env.NEXT_PUBLIC_MOCK_MEZO_ADDRESS || "";

export default function ProviderPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <p className="text-zinc-400">
          Stake MEZO to list your AI service on the marketplace.
        </p>
        <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
          Connect your wallet to manage your services.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <p className="text-zinc-400 mt-2">Manage your AI services on CapCipCup.</p>
      </div>
      <MyServices address={address!} />
      <RegisterForm />
    </div>
  );
}

function MyServices({ address }: { address: `0x${string}` }) {
  const registryAddress = CONTRACT_ADDRESSES.serviceRegistry as `0x${string}`;
  const { toast } = useToast();

  const { data: services, refetch } = useReadContract({
    address: registryAddress,
    abi: SERVICE_REGISTRY_ABI,
    functionName: "getServicesByOwner",
    args: [address],
    query: { enabled: !!registryAddress },
  });

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  if (isSuccess) {
    toast("Service delisted. Stake returned.", "success", txHash);
    refetch();
  }

  const serviceList = (services as any[]) || [];
  const activeServices = serviceList.filter((s) => s.isActive);

  if (activeServices.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 text-center">
        <p className="text-zinc-500">You don't have any active services yet. Register one below.</p>
      </div>
    );
  }

  function handleDelist(serviceId: bigint) {
    if (!registryAddress) return;
    writeContract({
      address: registryAddress,
      abi: SERVICE_REGISTRY_ABI,
      functionName: "delist",
      args: [serviceId],
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Active Services</h2>
      <div className="grid gap-4">
        {activeServices.map((svc: any) => (
          <div key={Number(svc.id)} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{svc.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{svc.endpoint}</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-xs">Active</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <span>Price: <strong className="text-[#F7931A]">{formatEther(svc.pricePerRequest)} MUSD</strong></span>
              <span>Staked: <strong>{formatEther(svc.mezoStaked)} MEZO</strong></span>
              <span>Free tier: <strong>{Number(svc.freeTierLimit)}</strong> requests</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleDelist(svc.id)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-900/50 text-red-400 text-xs font-medium hover:bg-red-800/50 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Delisting..." : "Delist & Return Stake"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegisterForm() {
  const registryAddress = CONTRACT_ADDRESSES.serviceRegistry as `0x${string}`;
  const { toast } = useToast();

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
    toast(`Service "${form.name}" registered on-chain!`, "success", registerTx);
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
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Register New Service</h2>
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-6 text-center">
          <p className="text-emerald-400 text-lg font-medium">
            Your service "{form.name}" is now live on CapCipCup.
          </p>
          <p className="text-zinc-500 mt-2 text-sm">
            Staked {form.stakeAmount} MEZO. Users can now discover and pay for your service.
          </p>
          <button
            onClick={() => { setStep("form"); setForm({ name: "", endpoint: "", price: "0.005", metadataURI: "", freeTierLimit: "3", stakeAmount: "100" }); }}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">Register New Service</h2>
      <p className="text-zinc-400 text-sm">
        Stake MEZO to list your AI service. Users pay per request with MUSD.
      </p>

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
