import { Request, Response, NextFunction } from "express";
import { db } from "../db/database.js";

/**
 * Checks if the consumer has free tier requests remaining.
 * Wallet address passed via x-wallet-address header.
 * If no wallet provided, uses IP as identifier (for non-wallet free trials).
 */
export function freeTierMiddleware(req: Request, res: Response, next: NextFunction) {
  const serviceId = String(req.params.id);
  const wallet = String(req.headers["x-wallet-address"] || req.ip || "anonymous");

  const service = db.getServiceConfig(serviceId);
  if (!service || service.freeTierLimit === 0) {
    return res.status(402).json({
      error: "No free tier available for this service",
      paidEndpoint: `/api/service/${serviceId}`,
    });
  }

  const used = db.getFreeTierUsage(wallet, serviceId);
  if (used >= service.freeTierLimit) {
    return res.status(402).json({
      error: "Free tier exhausted",
      used,
      limit: service.freeTierLimit,
      paidEndpoint: `/api/service/${serviceId}`,
    });
  }

  db.incrementFreeTier(wallet, serviceId);
  next();
}
