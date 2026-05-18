import { Request, Response } from "express";
import { getAllServiceConfigs } from "../services/aiProviders.js";
import { db } from "../db/database.js";

/**
 * Lists all available AI services with their metadata and metrics.
 */
export function servicesListHandler(_req: Request, res: Response) {
  const configs = getAllServiceConfigs();

  const services = configs.map((svc) => {
    const metrics = db.getMetrics(svc.id);
    return {
      id: svc.id,
      name: svc.name,
      provider: "openrouter",
      model: svc.model,
      priceMusd: "$0.005",
      freeTierLimit: 3,
      metrics: {
        totalRequests: metrics.totalRequests,
        successRate: metrics.successRate,
        avgResponseTimeMs: metrics.avgResponseTimeMs,
      },
    };
  });

  res.json({ services });
}
