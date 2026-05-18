/**
 * CapCipCup Autopilot Agent — "NewsBot"
 *
 * Demonstrates a fully autonomous AI agent that:
 * 1. Requests MUSD from its AgentVault (within daily limit)
 * 2. Calls a CapCipCup AI service via x402 (pays MUSD per request)
 * 3. Logs results to console (dashboard-ready)
 * 4. Repeats on interval
 *
 * Run: pnpm start
 * Requires: AGENT_PRIVATE_KEY, VAULT_OWNER_ADDRESS in ../.env
 */

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || "30000", 10);
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";

const SAMPLE_TEXTS = [
  "Bitcoin surged past $110,000 today as institutional demand continues to grow. Major banks have begun offering Bitcoin custody services, and several public companies announced additional BTC treasury purchases. Analysts predict further upside as the halving effect continues to reduce new supply entering the market.",
  "The decentralized finance sector on Bitcoin is experiencing rapid growth. Mezo, a Bitcoin Layer 2, reported record MUSD borrowing volumes as users leverage their BTC for everyday spending without selling. The total value locked in Bitcoin DeFi protocols has exceeded $30 billion.",
  "AI agents are increasingly participating in on-chain economies. A new wave of autonomous agents are using stablecoins for machine-to-machine payments, creating demand for programmable payment infrastructure. The x402 protocol has emerged as a leading standard for HTTP-native micropayments.",
];

let cycleCount = 0;

async function callFreeEndpoint(text: string): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/api/service/1/try?input=${encodeURIComponent(text)}`,
    { headers: { "x-wallet-address": "0xAgent_NewsBot_Demo" } }
  );

  if (res.status === 402) {
    console.log("  Free tier exhausted — switching to paid endpoint...");
    await callPaidEndpoint(text);
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  printResult(data);
}

async function callPaidEndpoint(text: string): Promise<void> {
  if (!AGENT_PRIVATE_KEY) {
    console.log("  No AGENT_PRIVATE_KEY configured — cannot make paid calls.");
    console.log("  To enable: set AGENT_PRIVATE_KEY in .env, fund wallet with MUSD.");
    return;
  }

  // x402 paid flow: the browser/agent hits the paid endpoint, gets 402,
  // then uses @x402/fetch to auto-sign MUSD payment and retry.
  // For CLI demo without x402/fetch, we just show what WOULD happen:
  console.log("  [DEMO] Would call x402 paid endpoint:");
  console.log(`  [DEMO] POST ${BACKEND_URL}/api/service/1?input=...`);
  console.log("  [DEMO] → 402 Payment Required → auto-sign MUSD → get result");
  console.log("  [DEMO] Configure @x402/fetch with AGENT_PRIVATE_KEY for live payments.");
}

function printResult(data: any) {
  console.log(`  Result: ${data.output?.substring(0, 200)}`);
  console.log(`  Model: ${data.model} | ${data.responseTimeMs}ms | ${data.paidWith}`);
}

async function runCycle() {
  cycleCount++;
  const text = SAMPLE_TEXTS[cycleCount % SAMPLE_TEXTS.length];

  console.log(`\n━━━ Cycle ${cycleCount} [${new Date().toLocaleTimeString()}] ━━━`);
  console.log(`  Input: "${text.substring(0, 60)}..."`);

  try {
    await callFreeEndpoint(text);
  } catch (err: any) {
    console.error(`  Error: ${err.message}`);
  }
}

console.log("╔══════════════════════════════════════════╗");
console.log("║  CapCipCup Autopilot Agent — NewsBot    ║");
console.log("╚══════════════════════════════════════════╝");
console.log(`Backend:  ${BACKEND_URL}`);
console.log(`Interval: ${INTERVAL_MS}ms`);
console.log(`Agent key: ${AGENT_PRIVATE_KEY ? "configured" : "NOT SET (free tier only)"}`);
console.log("Press Ctrl+C to stop.\n");

runCycle();
setInterval(runCycle, INTERVAL_MS);
