"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESSES, AGENT_VAULT_ABI, ERC20_ABI, MUSD_ADDRESS } from "@/lib/contracts";

export default function VaultPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Agent Vault</h1>
        <p className="text-zinc-400">
          Deposit MUSD and let your AI agents spend autonomously within daily limits.
        </p>
        <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
          Connect your wallet to manage your vault.
        </div>
      </div>
    );
  }

  return <VaultDashboard address={address!} />;
}

function VaultDashboard({ address }: { address: `0x${string}` }) {
  const vaultAddress = CONTRACT_ADDRESSES.agentVault as `0x${string}`;

  const { data: vaultInfo, refetch: refetchVault } = useReadContract({
    address: vaultAddress,
    abi: AGENT_VAULT_ABI,
    functionName: "getVaultInfo",
    args: [address],
    query: { enabled: !!vaultAddress },
  });

  const { data: musdBalance, refetch: refetchBalance } = useReadContract({
    address: MUSD_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const balance = vaultInfo ? formatEther(vaultInfo[0] as bigint) : "0";
  const dailyLimit = vaultInfo ? formatEther(vaultInfo[1] as bigint) : "0";
  const walletMusd = musdBalance ? formatEther(musdBalance as bigint) : "0";

  function refetchAll() {
    refetchVault();
    refetchBalance();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agent Vault</h1>
        <p className="text-zinc-400 mt-2">
          Deposit MUSD and let your AI agents spend autonomously within daily limits.
        </p>
      </div>

      {!vaultAddress && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-950/30 p-4 text-sm text-yellow-400">
          AgentVault contract not deployed yet. Deploy contracts first.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Vault Balance" value={`${Number(balance).toFixed(4)} MUSD`} />
        <StatCard label="Daily Limit" value={`${Number(dailyLimit).toFixed(4)} MUSD`} />
        <StatCard label="Wallet MUSD" value={`${Number(walletMusd).toFixed(4)} MUSD`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepositForm vaultAddress={vaultAddress} onSuccess={refetchAll} />
        <WithdrawForm vaultAddress={vaultAddress} balance={balance} onSuccess={refetchAll} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SetLimitForm vaultAddress={vaultAddress} currentLimit={dailyLimit} onSuccess={refetchAll} />
        <OperatorForm vaultAddress={vaultAddress} onSuccess={refetchAll} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-xl font-semibold mt-1 text-zinc-100">{value}</p>
    </div>
  );
}

function DepositForm({ vaultAddress, onSuccess }: { vaultAddress: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState("");
  const { writeContract: approve, data: approveTx, reset: resetApprove } = useWriteContract();
  const { writeContract: deposit, data: depositTx, reset: resetDeposit } = useWriteContract();
  const [step, setStep] = useState<"idle" | "approving" | "depositing">("idle");

  const { isLoading: approveLoading, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTx,
    query: { enabled: !!approveTx },
  });

  const { isLoading: depositLoading, isSuccess: depositSuccess } = useWaitForTransactionReceipt({
    hash: depositTx,
    query: { enabled: !!depositTx },
  });

  useEffect(() => {
    if (approveSuccess && step === "approving") {
      setStep("depositing");
      const wei = parseEther(amount);
      deposit({
        address: vaultAddress as `0x${string}`,
        abi: AGENT_VAULT_ABI,
        functionName: "deposit",
        args: [wei],
      });
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (depositSuccess) {
      onSuccess();
      setStep("idle");
      setAmount("");
      resetApprove();
      resetDeposit();
    }
  }, [depositSuccess]);

  function handleDeposit() {
    if (!amount || !vaultAddress) return;
    const wei = parseEther(amount);
    setStep("approving");
    approve({
      address: MUSD_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [vaultAddress as `0x${string}`, wei],
    });
  }

  const loading = approveLoading || depositLoading;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Deposit MUSD</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (e.g. 10)"
        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A]"
      />
      <button
        onClick={handleDeposit}
        disabled={!amount || loading || step !== "idle"}
        className="w-full px-4 py-2.5 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors disabled:opacity-50"
      >
        {loading
          ? step === "approving"
            ? "Approving MUSD..."
            : "Depositing..."
          : "Deposit MUSD"}
      </button>
      {depositSuccess && (
        <p className="text-xs text-emerald-400 text-center">Deposit successful!</p>
      )}
    </div>
  );
}

function WithdrawForm({ vaultAddress, balance, onSuccess }: { vaultAddress: string; balance: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState("");
  const { writeContract, data: txHash, reset } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      setAmount("");
      reset();
    }
  }, [isSuccess]);

  function handleWithdraw() {
    if (!amount || !vaultAddress) return;
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: AGENT_VAULT_ABI,
      functionName: "withdraw",
      args: [parseEther(amount)],
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Withdraw MUSD</h3>
      <p className="text-xs text-zinc-500">Available: {balance} MUSD</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to withdraw"
        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A]"
      />
      <button
        onClick={handleWithdraw}
        disabled={!amount || isLoading}
        className="w-full px-4 py-2.5 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Withdrawing..." : "Withdraw"}
      </button>
    </div>
  );
}

function SetLimitForm({ vaultAddress, currentLimit, onSuccess }: { vaultAddress: string; currentLimit: string; onSuccess: () => void }) {
  const [limit, setLimit] = useState("");
  const { writeContract, data: txHash, reset } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      setLimit("");
      reset();
    }
  }, [isSuccess]);

  function handleSetLimit() {
    if (!limit || !vaultAddress) return;
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: AGENT_VAULT_ABI,
      functionName: "setDailyLimit",
      args: [parseEther(limit)],
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Daily Spending Limit</h3>
      <p className="text-xs text-zinc-500">Current: {currentLimit} MUSD/day</p>
      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="New daily limit (e.g. 5)"
        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A]"
      />
      <button
        onClick={handleSetLimit}
        disabled={!limit || isLoading}
        className="w-full px-4 py-2.5 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Setting..." : "Set Limit"}
      </button>
    </div>
  );
}

function OperatorForm({ vaultAddress, onSuccess }: { vaultAddress: string; onSuccess: () => void }) {
  const [operator, setOperator] = useState("");
  const { writeContract: approveOp, data: approveTx, reset: resetApprove } = useWriteContract();
  const { writeContract: revokeOp, data: revokeTx, reset: resetRevoke } = useWriteContract();

  const { isLoading: approving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTx,
    query: { enabled: !!approveTx },
  });

  const { isLoading: revoking, isSuccess: revokeSuccess } = useWaitForTransactionReceipt({
    hash: revokeTx,
    query: { enabled: !!revokeTx },
  });

  useEffect(() => {
    if (approveSuccess) {
      onSuccess();
      setOperator("");
      resetApprove();
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (revokeSuccess) {
      onSuccess();
      setOperator("");
      resetRevoke();
    }
  }, [revokeSuccess]);

  function handleApprove() {
    if (!operator || !vaultAddress) return;
    approveOp({
      address: vaultAddress as `0x${string}`,
      abi: AGENT_VAULT_ABI,
      functionName: "approveOperator",
      args: [operator as `0x${string}`],
    });
  }

  function handleRevoke() {
    if (!operator || !vaultAddress) return;
    revokeOp({
      address: vaultAddress as `0x${string}`,
      abi: AGENT_VAULT_ABI,
      functionName: "revokeOperator",
      args: [operator as `0x${string}`],
    });
  }

  const loading = approving || revoking;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Agent Operators</h3>
      <p className="text-xs text-zinc-500">
        Approve an agent wallet to spend from your vault within daily limits.
      </p>
      <input
        type="text"
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        placeholder="Agent wallet address (0x...)"
        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A]"
      />
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={!operator || loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {approving ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={handleRevoke}
          disabled={!operator || loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-red-900 text-red-200 text-sm font-medium hover:bg-red-800 transition-colors disabled:opacity-50"
        >
          {revoking ? "Revoking..." : "Revoke"}
        </button>
      </div>
    </div>
  );
}
