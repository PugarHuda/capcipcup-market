/**
 * CapCipCup Autopilot Agent — "NewsBot"
 *
 * Fully autonomous AI agent that:
 * 1. Requests MUSD from its AgentVault (within daily limit)
 * 2. Transfers MUSD to the payment receiver
 * 3. Calls the CapCipCup paid API endpoint with the tx hash as proof
 * 4. Logs results to console
 * 5. Repeats on interval
 *
 * Run: pnpm start
 * Requires: AGENT_PRIVATE_KEY, VAULT_OWNER_ADDRESS in ../.env
 */

import * as dotenv from "dotenv";
import { createWalletClient, createPublicClient, http, parseEther, formatEther, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

dotenv.config({ path: "../.env" });

const BACKEND_URL = process.env.BACKEND_URL || "https://capcipcup-api.vercel.app";
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || "60000", 10);
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";
const VAULT_OWNER_ADDRESS = process.env.VAULT_OWNER_ADDRESS || "";
const MUSD_ADDRESS = process.env.MUSD_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";
const AGENT_VAULT_ADDRESS = process.env.AGENT_VAULT_ADDRESS || "0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1";
const PAYMENT_RECEIVER = process.env.PAYMENT_RECEIVER || "0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb";

const PRICE_PER_REQUEST = parseEther("0.005");

const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.test.mezo.org"] } },
  blockExplorers: { default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" } },
});

const VAULT_ABI = [
  {
    name: "requestFunds",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const SAMPLE_TEXTS = [
  "Bitcoin surged past $110,000 today as institutional demand continues to grow. Major banks have begun offering Bitcoin custody services, and several public companies announced additional BTC treasury purchases. Analysts predict further upside as the halving effect continues to reduce new supply entering the market.",
  "The decentralized finance sector on Bitcoin is experiencing rapid growth. Mezo, a Bitcoin Layer 2, reported record MUSD borrowing volumes as users leverage their BTC for everyday spending without selling. The total value locked in Bitcoin DeFi protocols has exceeded $30 billion.",
  "AI agents are increasingly participating in on-chain economies. A new wave of autonomous agents are using stablecoins for machine-to-machine payments, creating demand for programmable payment infrastructure. The x402 protocol has emerged as a leading standard for HTTP-native micropayments.",
];

let cycleCount = 0;

async function runWithRealPayments() {
  if (!AGENT_PRIVATE_KEY) {
    console.log("  No AGENT_PRIVATE_KEY — falling back to free tier only.");
    return false;
  }

  const account = privateKeyToAccount(AGENT_PRIVATE_KEY as Hex);
  const publicClient = createPublicClient({ chain: mezoTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: mezoTestnet, transport: http() });

  console.log(`  Agent wallet: ${account.address}`);

  // Check MUSD balance
  const balance = await publicClient.readContract({
    address: MUSD_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log(`  MUSD balance: ${formatEther(balance)}`);

  if (balance < PRICE_PER_REQUEST) {
    // Try to request funds from vault
    if (VAULT_OWNER_ADDRESS) {
      console.log("  Insufficient MUSD — requesting from AgentVault...");
      try {
        const hash = await walletClient.writeContract({
          address: AGENT_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "requestFunds",
          args: [VAULT_OWNER_ADDRESS as `0x${string}`, PRICE_PER_REQUEST],
        });
        console.log(`  Vault request tx: ${hash}`);
        await publicClient.waitForTransactionReceipt({ hash });
        console.log("  Funds received from vault.");
      } catch (err: any) {
        console.log(`  Vault request failed: ${err.message}`);
        return false;
      }
    } else {
      console.log("  No VAULT_OWNER_ADDRESS set — cannot request funds.");
      return false;
    }
  }

  // Transfer MUSD to payment receiver
  console.log(`  Transferring ${formatEther(PRICE_PER_REQUEST)} MUSD to ${PAYMENT_RECEIVER}...`);
  const txHash = await walletClient.writeContract({
    address: MUSD_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [PAYMENT_RECEIVER as `0x${string}`, PRICE_PER_REQUEST],
  });
  console.log(`  Payment tx: ${txHash}`);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("  Payment confirmed on-chain.");

  return txHash;
}

async function callFreeEndpoint(text: string): Promise<any> {
  const res = await fetch(
    `${BACKEND_URL}/api/service/1/try?input=${encodeURIComponent(text)}`,
    { headers: { "x-wallet-address": "0xAgent_NewsBot_Auto" } }
  );

  if (res.status === 402) {
    return null; // free tier exhausted
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

async function callPaidEndpoint(text: string, txHash: string, payer: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/service/1/paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: text, txHash, payer }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

function printResult(data: any) {
  console.log(`  Result: ${data.output?.substring(0, 200)}`);
  console.log(`  Model: ${data.model} | ${data.responseTimeMs}ms | ${data.paidWith}`);
  if (data.txHash) console.log(`  Tx: ${data.txHash}`);
}

async function runCycle() {
  cycleCount++;
  const text = SAMPLE_TEXTS[cycleCount % SAMPLE_TEXTS.length];

  console.log(`\n━━━ Cycle ${cycleCount} [${new Date().toLocaleTimeString()}] ━━━`);
  console.log(`  Input: "${text.substring(0, 60)}..."`);

  try {
    // Try free first
    const freeResult = await callFreeEndpoint(text);
    if (freeResult) {
      printResult(freeResult);
      return;
    }

    console.log("  Free tier exhausted — attempting paid flow...");

    // Make real on-chain payment
    const txHash = await runWithRealPayments();
    if (!txHash) {
      console.log("  Payment failed — skipping this cycle.");
      return;
    }

    // Call paid API
    const account = privateKeyToAccount(AGENT_PRIVATE_KEY as Hex);
    const paidResult = await callPaidEndpoint(text, txHash as string, account.address);
    printResult(paidResult);
  } catch (err: any) {
    console.error(`  Error: ${err.message}`);
  }
}

// --- Startup ---
console.log("╔══════════════════════════════════════════════╗");
console.log("║  CapCipCup Autopilot Agent — NewsBot v2     ║");
console.log("║  Real MUSD Payments via AgentVault          ║");
console.log("╚══════════════════════════════════════════════╝");
console.log(`Backend:    ${BACKEND_URL}`);
console.log(`Interval:   ${INTERVAL_MS}ms`);
console.log(`Agent key:  ${AGENT_PRIVATE_KEY ? "configured" : "NOT SET (free tier only)"}`);
console.log(`Vault:      ${AGENT_VAULT_ADDRESS}`);
console.log(`Owner:      ${VAULT_OWNER_ADDRESS || "NOT SET"}`);
console.log("Press Ctrl+C to stop.\n");

runCycle();
setInterval(runCycle, INTERVAL_MS);
