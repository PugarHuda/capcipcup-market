import { Request, Response, NextFunction } from "express";
import { db } from "../db/database.js";

/**
 * Runs AFTER x402 middleware has verified payment.
 * Logs the payment for review verification and analytics.
 */
export function trackPayment(req: Request, res: Response, next: NextFunction) {
  const serviceId = String(req.params.id);

  const payerAddress = String(req.headers["x-payer-address"] || "unknown");

  db.recordPayment({
    wallet: payerAddress,
    serviceId,
    amount: "0.005",
    timestamp: Date.now(),
  });

  next();
}
