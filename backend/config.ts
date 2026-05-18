import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  evmAddress: requireEnv("EVM_ADDRESS"),
  facilitatorUrl: process.env.FACILITATOR_URL || "https://facilitator.vativ.io/",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",

  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",

  serviceRegistryAddress: process.env.SERVICE_REGISTRY_ADDRESS || "",
  agentVaultAddress: process.env.AGENT_VAULT_ADDRESS || "",
  reviewSystemAddress: process.env.REVIEW_SYSTEM_ADDRESS || "",
};
