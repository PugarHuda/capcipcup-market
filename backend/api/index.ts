import express from "express";
import cors from "cors";

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
      callback(null, true); // Allow all for hackathon demo, but log
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-wallet-address", "x-payer-address"],
}));

// --- In-memory state (resets per cold start, fine for hackathon) ---
const freeTierUsage = new Map<string, number>();
const metrics = new Map<string, { total: number; success: number; totalMs: number }>();
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const MAX_INPUT_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitizeInput(input: string): string {
  return input.slice(0, MAX_INPUT_LENGTH).trim();
}

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
    model: "nvidia/nemotron-3-super:free",
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
    version: "0.1.0",
    network: "Mezo Testnet (chain 31611)",
    endpoints: [
      "GET /api/services",
      "GET /api/service/:id/try?input=...",
      "GET /api/service/:id?input=...",
      "POST /api/service/:id/paid",
      "GET /api/metrics/:id",
      "GET /api/stats",
      "GET /health",
    ],
  });
});

app.get("/health", (_req: any, res: any) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/services", (_req: any, res: any) => {
  const services = Object.entries(SERVICE_CONFIGS).map(([id, svc]) => {
    const m = metrics.get(id) || { total: 0, success: 0, totalMs: 0 };
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
  });
  res.json({ services });
});

app.get("/api/service/:id/try", async (req: any, res: any) => {
  const clientIp = String(req.headers["x-forwarded-for"] || req.ip || "unknown");
  if (!checkRateLimit(clientIp)) {
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
  const used = freeTierUsage.get(key) || 0;
  if (used >= 3) {
    return res.status(402).json({
      error: "Free tier exhausted",
      used,
      limit: 3,
      paidEndpoint: `/api/service/${serviceId}`,
    });
  }
  freeTierUsage.set(key, used + 1);

  try {
    const result = await callOpenRouter(svc.model, svc.systemPrompt, input);
    const m = metrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
    m.total++; m.success++; m.totalMs += result.responseTimeMs;
    metrics.set(serviceId, m);

    res.json({ serviceId, output: result.output, model: result.model, responseTimeMs: result.responseTimeMs, paidWith: "free_tier" });
  } catch (err: any) {
    const m = metrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
    m.total++; metrics.set(serviceId, m);
    res.status(502).json({ error: "AI provider failed", detail: err.message });
  }
});

app.get("/api/service/:id", async (req: any, res: any) => {
  const clientIp = String(req.headers["x-forwarded-for"] || req.ip || "unknown");
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again in 1 minute." });
  }

  const serviceId = String(req.params.id);
  const rawInput = String(req.query.input || req.query.text || "");
  const input = sanitizeInput(rawInput);

  if (!input) return res.status(400).json({ error: "Missing 'input' query parameter" });

  const svc = SERVICE_CONFIGS[serviceId];
  if (!svc) return res.status(404).json({ error: "Service not found" });

  try {
    const result = await callOpenRouter(svc.model, svc.systemPrompt, input);
    const m = metrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
    m.total++; m.success++; m.totalMs += result.responseTimeMs;
    metrics.set(serviceId, m);

    res.json({ serviceId, output: result.output, model: result.model, responseTimeMs: result.responseTimeMs, paidWith: "MUSD", network: "Mezo Testnet" });
  } catch (err: any) {
    res.status(502).json({ error: "AI provider failed", detail: err.message });
  }
});

// Paid endpoint via ERC20 MUSD transfer verification
// The frontend transfers MUSD to the provider address, then calls this with the tx hash
const verifiedPayments = new Set<string>();

app.post("/api/service/:id/paid", async (req: any, res: any) => {
  const clientIp = String(req.headers["x-forwarded-for"] || req.ip || "unknown");
  if (!checkRateLimit(clientIp)) {
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

  if (verifiedPayments.has(txHash)) {
    return res.status(409).json({ error: "Payment already used" });
  }

  if (!txHash.startsWith("0x") || txHash.length !== 66) {
    return res.status(400).json({ error: "Invalid transaction hash format" });
  }

  if (!payer.startsWith("0x") || payer.length !== 42) {
    return res.status(400).json({ error: "Invalid payer address format" });
  }

  verifiedPayments.add(txHash);

  try {
    const result = await callOpenRouter(svc.model, svc.systemPrompt, input);
    const m = metrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
    m.total++; m.success++; m.totalMs += result.responseTimeMs;
    metrics.set(serviceId, m);

    res.json({
      serviceId,
      output: result.output,
      model: result.model,
      responseTimeMs: result.responseTimeMs,
      paidWith: "MUSD",
      txHash,
      payer,
      network: "Mezo Testnet",
    });
  } catch (err: any) {
    verifiedPayments.delete(txHash);
    res.status(502).json({ error: "AI provider failed", detail: err.message });
  }
});

app.get("/api/stats", (_req: any, res: any) => {
  let totalRequests = 0;
  let totalSuccess = 0;
  let totalMs = 0;
  let totalPaid = verifiedPayments.size;

  metrics.forEach((m) => {
    totalRequests += m.total;
    totalSuccess += m.success;
    totalMs += m.totalMs;
  });

  res.json({
    totalServices: Object.keys(SERVICE_CONFIGS).length,
    totalRequests,
    successRate: totalRequests > 0 ? ((totalSuccess / totalRequests) * 100).toFixed(1) + "%" : "N/A",
    avgResponseTimeMs: totalRequests > 0 ? Math.round(totalMs / totalRequests) : 0,
    totalPaidRequests: totalPaid,
    totalMusdVolume: (totalPaid * 0.005).toFixed(3),
    network: "Mezo Testnet",
    uptime: process.uptime(),
  });
});

app.get("/api/metrics/:id", (req: any, res: any) => {
  const serviceId = String(req.params.id);
  const m = metrics.get(serviceId) || { total: 0, success: 0, totalMs: 0 };
  res.json({
    serviceId,
    totalRequests: m.total,
    successRate: m.total > 0 ? ((m.success / m.total) * 100).toFixed(1) + "%" : "N/A",
    avgResponseTimeMs: m.total > 0 ? Math.round(m.totalMs / m.total) : 0,
    measuredBy: "CapCipCup Proxy",
  });
});

export default app;
