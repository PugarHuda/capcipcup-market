import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-wallet-address", "x-payer-address"],
}));

// --- In-memory state (resets per cold start, fine for hackathon) ---
const freeTierUsage = new Map<string, number>();
const metrics = new Map<string, { total: number; success: number; totalMs: number }>();

const SERVICE_CONFIGS: Record<string, { name: string; model: string; systemPrompt: string }> = {
  "1": {
    name: "Text Summarizer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a concise text summarizer. Summarize the given text in 2-3 sentences.",
  },
  "2": {
    name: "Sentiment Analyzer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a sentiment analyzer. Analyze the sentiment of the given text. Respond with: sentiment (positive/negative/neutral), confidence (0-100), and a one-sentence explanation.",
  },
  "3": {
    name: "Code Explainer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a code explainer. Explain what the given code does in simple terms. Keep it under 3 sentences.",
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

app.get("/", (_req, res) => {
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
      "GET /health",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/services", (_req, res) => {
  const services = Object.entries(SERVICE_CONFIGS).map(([id, svc]) => {
    const m = metrics.get(id) || { total: 0, success: 0, totalMs: 0 };
    return {
      id,
      name: svc.name,
      provider: "openrouter",
      model: svc.model,
      priceMusd: "$0.005",
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

app.get("/api/service/:id/try", async (req, res) => {
  const serviceId = String(req.params.id);
  const input = String(req.query.input || req.query.text || "");
  const wallet = String(req.headers["x-wallet-address"] || req.ip || "anon");

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

app.get("/api/service/:id", async (req, res) => {
  const serviceId = String(req.params.id);
  const input = String(req.query.input || req.query.text || "");

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

app.post("/api/service/:id/paid", async (req, res) => {
  const serviceId = String(req.params.id);
  const { input, txHash, payer } = req.body;

  if (!input) return res.status(400).json({ error: "Missing 'input' in body" });
  if (!txHash) return res.status(400).json({ error: "Missing 'txHash' in body" });
  if (!payer) return res.status(400).json({ error: "Missing 'payer' in body" });

  const svc = SERVICE_CONFIGS[serviceId];
  if (!svc) return res.status(404).json({ error: "Service not found" });

  if (verifiedPayments.has(txHash)) {
    return res.status(409).json({ error: "Payment already used" });
  }

  // For hackathon demo: accept any valid-looking tx hash from a connected wallet
  // In production, verify on-chain that the tx transferred the correct MUSD amount
  if (!txHash.startsWith("0x") || txHash.length !== 66) {
    return res.status(400).json({ error: "Invalid transaction hash format" });
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

app.get("/api/metrics/:id", (req, res) => {
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
