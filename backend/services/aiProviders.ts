import { config } from "../config.js";

export interface InferenceResult {
  output: string;
  model: string;
  responseTimeMs: number;
  success: boolean;
  error?: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  "1": {
    id: "1",
    name: "Text Summarizer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt: "You are a concise text summarizer. Summarize the given text in 2-3 sentences.",
  },
  "2": {
    id: "2",
    name: "Sentiment Analyzer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt:
      "You are a sentiment analyzer. Analyze the sentiment of the given text. Respond with: sentiment (positive/negative/neutral), confidence (0-100), and a one-sentence explanation.",
  },
  "3": {
    id: "3",
    name: "Code Explainer",
    model: "openai/gpt-oss-120b:free",
    systemPrompt:
      "You are a code explainer. Explain what the given code does in simple terms. Keep it under 3 sentences.",
  },
};

export function getServiceConfig(id: string): ServiceConfig | undefined {
  return SERVICE_CONFIGS[id];
}

export function getAllServiceConfigs(): ServiceConfig[] {
  return Object.values(SERVICE_CONFIGS);
}

export async function callProvider(serviceId: string, input: string): Promise<InferenceResult> {
  const svc = SERVICE_CONFIGS[serviceId];
  if (!svc) {
    return { output: "", model: "", responseTimeMs: 0, success: false, error: "Service not found" };
  }

  const start = Date.now();

  try {
    return await callOpenRouter(svc, input, start);
  } catch (err: any) {
    return {
      output: "",
      model: svc.model,
      responseTimeMs: Date.now() - start,
      success: false,
      error: err.message || "Provider error",
    };
  }
}

async function callOpenRouter(svc: ServiceConfig, input: string, start: number): Promise<InferenceResult> {
  const apiKey = config.openrouterApiKey;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": "CapCipCup Market",
      "HTTP-Referer": "https://capcipcup.xyz",
    },
    body: JSON.stringify({
      model: svc.model,
      messages: [
        { role: "system", content: svc.systemPrompt },
        { role: "user", content: input },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const output = data.choices?.[0]?.message?.content || "";

  return {
    output,
    model: data.model || svc.model,
    responseTimeMs: Date.now() - start,
    success: true,
  };
}
