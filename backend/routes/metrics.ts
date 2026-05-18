import { Request, Response } from "express";
import { db } from "../db/database.js";

/**
 * Returns objective quality metrics for a service, measured by the proxy.
 */
export function metricsHandler(req: Request, res: Response) {
  const serviceId = String(req.params.id);
  const metrics = db.getMetrics(serviceId);

  res.json({
    serviceId,
    ...metrics,
    measuredBy: "CapCipCup Proxy",
  });
}
