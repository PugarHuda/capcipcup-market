import { Request, Response } from "express";
import { callProvider } from "../services/aiProviders.js";
import { db } from "../db/database.js";

/**
 * Paid service endpoint. Reached AFTER x402 payment is verified.
 */
export async function serviceHandler(req: Request, res: Response) {
  const serviceId = String(req.params.id);
  const input = String(req.query.input || req.query.text || "");

  if (!input) {
    return res.status(400).json({ error: "Missing 'input' or 'text' query parameter" });
  }

  const result = await callProvider(serviceId, input);

  db.recordMetric(serviceId, result.responseTimeMs, result.success);

  if (!result.success) {
    return res.status(502).json({
      error: "AI provider failed",
      detail: result.error,
      responseTimeMs: result.responseTimeMs,
    });
  }

  res.json({
    serviceId,
    output: result.output,
    model: result.model,
    responseTimeMs: result.responseTimeMs,
    paidWith: "MUSD",
    network: "Mezo Testnet",
  });
}

/**
 * Free trial endpoint. Same logic, no payment required.
 */
export async function serviceTryHandler(req: Request, res: Response) {
  const serviceId = String(req.params.id);
  const input = String(req.query.input || req.query.text || "");

  if (!input) {
    return res.status(400).json({ error: "Missing 'input' or 'text' query parameter" });
  }

  const result = await callProvider(serviceId, input);

  db.recordMetric(serviceId, result.responseTimeMs, result.success);

  if (!result.success) {
    return res.status(502).json({ error: "AI provider failed", detail: result.error });
  }

  res.json({
    serviceId,
    output: result.output,
    model: result.model,
    responseTimeMs: result.responseTimeMs,
    paidWith: "free_tier",
  });
}
