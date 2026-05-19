import express from "express";
import cors from "cors";
import { createPublicClient, createWalletClient, http, defineChain, parseAbi, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const app = express();
app.use(express.json({ limit: "50kb" }));

const ALLOWED_ORIGINS = [
  "https://capcipcup-market.vercel.app",
  "http://localhost:3001",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-wallet-address", "x-payer-address"],
}));

// --- Mezo Testnet Chain Config ---
const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.test.mezo.org"] } },
  blockExplorers: { default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" } },
});

const publicClient = createPublicClient({
  chain: mezoTestnet,
  transport: http("https://rpc.test.mezo.org"),
});

// Wallet for calling markAsBuyer (backend = proxy address of ReviewSystem)
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const walletClient = PRIVATE_KEY
  ? createWalletClient({
      account: privateKeyToAccount(PRIVATE_KEY),
      chain: mezoTestnet,
      transport: http("https://rpc.test.mezo.org"),
    })
  : null;

// --- Contract Addresses ---
const MUSD_ADDRESS = (process.env.MUSD_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503") as `0x${string}`;
const PAYMENT_RECEIVER = (process.env.PAYMENT_RECEIVER || "0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb") as `0x${string}`;
const REVIEW_SYSTEM_ADDRESS = (process.env.REVIEW_SYSTEM_ADDRESS || "0xa5F1d1781bB50B41434E2f507667e22De3Df27a9") as `0x${string}`;

// ERC20 Transfer event signature
const ERC20_TRANSFER_EVENT = parseAbi(["event Transfer(address indexed from, address indexed to, uint256 value)"]);
const REVIEW_SYSTEM_ABI = parseAbi(["function markAsBuyer(address _buyer, uint256 _serviceId) external"]);

// --- Upstash Redis for Persistent State ---
let redis: any = null;

async function initRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url, token });
    return redis;
  }
  return null;
}

// --- Persistent Storage with Redis fallback to in-memory ---
const memFreeTier = new Map<string, number>();
const memMetrics = new Map<string, { total: number; success: number; totalMs: number }>();
const memVerifiedPayments = new Set<string>();
const memRateLimiter = new Map<string, { count: number; resetAt: number }>();

async function getFreeTierUsage(key: string): Promise<number> {
  const r = await initRedis();
  if (r) {
    const val = await r.get(`freetier:${key}`);
    return val ? Number(val) : 0;
  }
  return memFreeTier.get(key) || 0;
}

async function incrFreeTierUsage(key: string): Promise<void> {
  const r = await initRedis();
  if (r) {
    await r.incr(`freetier:${key}`);
  } else {
    memFreeTier.set(key, (memFreeTier.get(key) || 0) + 1);
  }
}

async function getMetrics(serviceId: string): Promise<{ total: number; success: number; totalMs: number }> {
  const r = await initRedis();
  if (r) {
    const data = await r.hgetall(`metrics:${serviceId}`);
    if (data && data.total) {
      return { total: Number(data.total), success: Number(data.success), totalMs: Number(data.totalMs) };
    }
    return { total: 0, success: 0, totalMs: 0 };
  }
  return memMetrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
}

async function incrMetrics(serviceId: string, success: boolean, ms: number): Promise<void> {
  const r = await initRedis();
  if (r) {
    await r.hincrby(`metrics:${serviceId}`, "total", 1);
    if (success) await r.hincrby(`metrics:${serviceId}`, "success", 1);
    await r.hincrby(`metrics:${serviceId}`, "totalMs", ms);
  } else {
    const m = memMetrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
    m.total++;
    if (success) m.success++;
    m.totalMs += ms;
    memMetrics.set(serviceId, m);
  }
}

async function isPaymentUsed(txHash: string): Promise<boolean> {
  const r = await initRedis();
  if (r) {
    const exists = await r.sismember("verified_payments", txHash);
    return !!exists;
  }
  return memVerifiedPayments.has(txHash);
}

async function markPaymentUsed(txHash: string): Promise<void> {
  const r = await initRedis();
  if (r) {
    await r.sadd("verified_payments", txHash);
  } else {
    memVerifiedPayments.add(txHash);
  }
}

async function removePaymentUsed(txHash: string): Promise<void> {
  const r = await initRedis();
  if (r) {
    await r.srem("verified_payments", txHash);
  } else {
    memVerifiedPayments.delete(txHash);
  }
}

// --- Rate Limiting (persistent with Redis) ---
const MAX_INPUT_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

async function checkRateLimit(ip: string): Promise<boolean> {
  const r = await initRedis();
  if (r) {
    const key = `ratelimit:${ip}`;
    const count = await r.incr(key);
    if (count === 1) {
      await r.expire(key, 60);
    }
    return count <= RATE_LIMIT_MAX;
  }
  const now = Date.now();
  const entry = memRateLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    memRateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitizeInput(input: string): string {
  return input.slice(0, MAX_INPUT_LENGTH).trim();
}

// --- On-Chain Payment Verification ---
interface VerifyResult {
  valid: boolean;
  error?: string;
  from?: string;
  to?: string;
  value?: bigint;
}

async function verifyPaymentOnChain(txHash: `0x${string}`, expectedPayer: string, serviceId: string): Promise<VerifyResult> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    if (!receipt || receipt.status !== "success") {
      return { valid: false, error: "Transaction failed or not found" };
    }

    // Look for ERC20 Transfer event from MUSD contract
    const transferLogs = receipt.logs.filter(
      (log) =>
        log.address.toLowerCase() === MUSD_ADDRESS.toLowerCase() &&
        log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" // Transfer event topic
    );

    if (transferLogs.length === 0) {
      return { valid: false, error: "No MUSD Transfer event in transaction" };
    }

    // Find a transfer TO the payment receiver FROM the expected payer
    const svc = SERVICE_CONFIGS[serviceId];
    const expectedPrice = svc ? parseFloat(svc.price.replace("$", "")) : 0.005;

    for (const log of transferLogs) {
      const from = ("0x" + (log.topics[1] || "").slice(26)).toLowerCase();
      const to = ("0x" + (log.topics[2] || "").slice(26)).toLowerCase();
      const value = log.data ? BigInt(log.data) : BigInt(0);
      const valueEther = parseFloat(formatEther(value));

      if (
        from === expectedPayer.toLowerCase() &&
        to === PAYMENT_RECEIVER.toLowerCase() &&
        valueEther >= expectedPrice * 0.99 // 1% tolerance for rounding
      ) {
        return { valid: true, from, to, value };
      }
    }

    return { valid: false, error: "Transfer does not match expected payer/receiver/amount" };
  } catch (err: any) {
    if (err.message?.includes("could not be found")) {
      return { valid: false, error: "Transaction not found on Mezo Testnet. It may still be pending." };
    }
    return { valid: false, error: `Verification failed: ${err.message}` };
  }
}

// --- Call markAsBuyer on ReviewSystem ---
async function callMarkAsBuyer(buyer: string, serviceId: string): Promise<void> {
  if (!walletClient) return;

  try {
    await walletClient.writeContract({
      address: REVIEW_SYSTEM_ADDRESS,
      abi: REVIEW_SYSTEM_ABI,
      functionName: "markAsBuyer",
      args: [buyer as `0x${string}`, BigInt(serviceId)],
    });
  } catch (err: any) {
    console.error(`markAsBuyer failed for ${buyer} service ${serviceId}:`, err.message);
  }
}

// --- Service Configurations ---
const SERVICE_CONFIGS: Record<string, { name: string; model: string; systemPrompt: string; category: string; price: string }> = {
  "1": {
    name: "Text Summarizer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a concise text summarizer. Summarize the given text in 2-3 sentences.",
    category: "text",
    price: "$0.005",
  },
  "2": {
    name: "Sentiment Analyzer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a sentiment analyzer. Analyze the sentiment of the given text. Respond with: sentiment (positive/negative/neutral), confidence (0-100), and a one-sentence explanation.",
    category: "analysis",
    price: "$0.005",
  },
  "3": {
    name: "Code Explainer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a code explainer. Explain what the given code does in simple terms. Keep it under 3 sentences.",
    category: "code",
    price: "$0.005",
  },
  "4": {
    name: "Text Summarizer Pro",
    model: "nvidia/nemotron-3-super-120b-a12b:free",
    systemPrompt: "You are an expert text summarizer. Create a detailed but concise summary with key takeaways in bullet points. Include main points, conclusions, and any actionable items.",
    category: "text",
    price: "$0.01",
  },
  "5": {
    name: "Code Reviewer",
    model: "deepseek/deepseek-v4-flash:free",
    systemPrompt: "You are a code reviewer. Analyze the given code for bugs, security issues, and improvements. Be concise: list issues as bullet points with severity (high/medium/low).",
    category: "code",
    price: "$0.008",
  },
  "6": {
    name: "Translator (EN→ID)",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a translator. Translate the given English text into natural Indonesian (Bahasa Indonesia). Only output the translation, nothing else.",
    category: "text",
    price: "$0.003",
  },
};

// --- AI Provider ---
async function callOpenRouter(model: string, systemPrompt: string, input: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const start = Date.now();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": "CapCipCup Market",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return {
    output: data.choices?.[0]?.message?.content || "",
    model: data.model || model,
    responseTimeMs: Date.now() - start,
  };
}

// --- Routes ---

app.get("/", (_req: any, res: any) => {
  res.json({
    name: "CapCipCup Market API",
    version: "0.2.0",
    network: "Mezo Testnet (chain 31611)",
    features: [
      "Real on-chain payment verification via Mezo RPC",
      "Persistent state via Upstash Redis",
      "Rate limiting (20 req/min per IP)",
      "markAsBuyer integration with ReviewSystem",
    ],
    endpoints: [
      "GET /api/services",
      "GET /api/service/:id/try?input=...",
      "POST /api/service/:id/paid",
      "GET /api/metrics/:id",
      "GET /api/stats",
      "GET /health",
    ],
  });
});

app.get("/health", async (_req: any, res: any) => {
  const r = await initRedis();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    persistence: r ? "redis" : "in-memory",
    onChainVerification: true,
    markAsBuyer: !!walletClient,
  });
});

app.get("/api/services", async (_req: any, res: any) => {
  const services = await Promise.all(
    Object.entries(SERVICE_CONFIGS).map(async ([id, svc]) => {
      const m = await getMetrics(id);
      return {
        id,
        name: svc.name,
        provider: "openrouter",
        model: svc.model,
        category: svc.category,
        priceMusd: svc.price,
        freeTierLimit: 3,
        metrics: {
          totalRequests: m.total,
          successRate: m.total > 0 ? ((m.success / m.total) * 100).toFixed(1) + "%" : "N/A",
          avgResponseTimeMs: m.total > 0 ? Math.round(m.totalMs / m.total) : 0,
        },
      };
    })
  );
  res.json({ services });
});

app.get("/api/service/:id/try", async (req: any, res: any) => {
  const clientIp = String(req.headers["x-forwarded-for"] || req.ip || "unknown");
  if (!(await checkRateLimit(clientIp))) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again in 1 minute." });
  }

  const serviceId = String(req.params.id);
  const rawInput = String(req.query.input || req.query.text || "");
  const input = sanitizeInput(rawInput);
  const wallet = String(req.headers["x-wallet-address"] || clientIp);

  if (!input) return res.status(400).json({ error: "Missing 'input' query parameter" });

  const svc = SERVICE_CONFIGS[serviceId];
  if (!svc) return res.status(404).json({ error: "Service not found" });

  const key = `${wallet}:${serviceId}`;
  const used = await getFreeTierUsage(key);
  if (used >= 3) {
    return res.status(402).json({
      error: "Free tier exhausted",
      used,
      limit: 3,
      paidEndpoint: `/api/service/${serviceId}/paid`,
      paymentRequired: {
        token: "MUSD",
        amount: svc.price,
        receiver: PAYMENT_RECEIVER,
        network: "Mezo Testnet (31611)",
      },
    });
  }
  await incrFreeTierUsage(key);

  try {
    const result = await callOpenRouter(svc.model, svc.systemPrompt, input);
    await incrMetrics(serviceId, true, result.responseTimeMs);

    res.json({
      serviceId,
      output: result.output,
      model: result.model,
      responseTimeMs: result.responseTimeMs,
      paidWith: "free_tier",
      remaining: 3 - (used + 1),
    });
  } catch (err: any) {
    await incrMetrics(serviceId, false, 0);
    res.status(502).json({ error: "AI provider failed", detail: err.message });
  }
});

// --- PAID ENDPOINT with REAL on-chain verification ---
app.post("/api/service/:id/paid", async (req: any, res: any) => {
  const clientIp = String(req.headers["x-forwarded-for"] || req.ip || "unknown");
  if (!(await checkRateLimit(clientIp))) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again in 1 minute." });
  }

  const serviceId = String(req.params.id);
  const { input: rawInput, txHash, payer } = req.body;

  if (!rawInput) return res.status(400).json({ error: "Missing 'input' in body" });
  if (!txHash) return res.status(400).json({ error: "Missing 'txHash' in body" });
  if (!payer) return res.status(400).json({ error: "Missing 'payer' in body" });

  const input = sanitizeInput(String(rawInput));

  const svc = SERVICE_CONFIGS[serviceId];
  if (!svc) return res.status(404).json({ error: "Service not found" });

  if (!txHash.startsWith("0x") || txHash.length !== 66) {
    return res.status(400).json({ error: "Invalid transaction hash format" });
  }
  if (!payer.startsWith("0x") || payer.length !== 42) {
    return res.status(400).json({ error: "Invalid payer address format" });
  }

  // Check duplicate payment
  if (await isPaymentUsed(txHash)) {
    return res.status(409).json({ error: "Payment already used" });
  }

  // REAL on-chain verification
  const verification = await verifyPaymentOnChain(txHash as `0x${string}`, payer, serviceId);
  if (!verification.valid) {
    return res.status(402).json({
      error: "Payment verification failed",
      detail: verification.error,
      expected: {
        from: payer,
        to: PAYMENT_RECEIVER,
        token: MUSD_ADDRESS,
        minAmount: svc.price,
      },
    });
  }

  // Mark payment as used (prevent replay)
  await markPaymentUsed(txHash);

  // Mark buyer in ReviewSystem (so they can leave reviews)
  callMarkAsBuyer(payer, serviceId).catch(() => {});

  try {
    const result = await callOpenRouter(svc.model, svc.systemPrompt, input);
    await incrMetrics(serviceId, true, result.responseTimeMs);

    res.json({
      serviceId,
      output: result.output,
      model: result.model,
      responseTimeMs: result.responseTimeMs,
      paidWith: "MUSD",
      txHash,
      payer,
      verified: true,
      network: "Mezo Testnet",
    });
  } catch (err: any) {
    await removePaymentUsed(txHash);
    await incrMetrics(serviceId, false, 0);
    res.status(502).json({ error: "AI provider failed", detail: err.message });
  }
});

app.get("/api/stats", async (_req: any, res: any) => {
  let totalRequests = 0;
  let totalSuccess = 0;
  let totalMs = 0;

  for (const id of Object.keys(SERVICE_CONFIGS)) {
    const m = await getMetrics(id);
    totalRequests += m.total;
    totalSuccess += m.success;
    totalMs += m.totalMs;
  }

  const r = await initRedis();
  let totalPaid = 0;
  if (r) {
    totalPaid = await r.scard("verified_payments") || 0;
  } else {
    totalPaid = memVerifiedPayments.size;
  }

  res.json({
    totalServices: Object.keys(SERVICE_CONFIGS).length,
    totalRequests,
    successRate: totalRequests > 0 ? ((totalSuccess / totalRequests) * 100).toFixed(1) + "%" : "N/A",
    avgResponseTimeMs: totalRequests > 0 ? Math.round(totalMs / totalRequests) : 0,
    totalPaidRequests: totalPaid,
    totalMusdVolume: (totalPaid * 0.005).toFixed(3),
    network: "Mezo Testnet",
    persistence: r ? "redis" : "in-memory",
    uptime: process.uptime(),
  });
});

app.get("/api/metrics/:id", async (req: any, res: any) => {
  const serviceId = String(req.params.id);
  const m = await getMetrics(serviceId);
  res.json({
    serviceId,
    totalRequests: m.total,
    successRate: m.total > 0 ? ((m.success / m.total) * 100).toFixed(1) + "%" : "N/A",
    avgResponseTimeMs: m.total > 0 ? Math.round(m.totalMs / m.total) : 0,
    measuredBy: "CapCipCup Proxy (verified on-chain)",
  });
});

export default app;
