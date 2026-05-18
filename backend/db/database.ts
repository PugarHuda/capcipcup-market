/**
 * In-memory database for hackathon MVP.
 * Tracks free tier usage, payments, and quality metrics.
 * Replace with SQLite or Postgres for production.
 */

interface PaymentRecord {
  wallet: string;
  serviceId: string;
  amount: string;
  timestamp: number;
}

interface MetricsData {
  totalRequests: number;
  successCount: number;
  failCount: number;
  totalResponseTimeMs: number;
  successRate: string;
  avgResponseTimeMs: number;
}

class InMemoryDB {
  private freeTierUsage: Map<string, number> = new Map();
  private payments: PaymentRecord[] = [];
  private metrics: Map<string, { total: number; success: number; fail: number; totalMs: number }> =
    new Map();
  private serviceConfigs: Map<string, { freeTierLimit: number }> = new Map();

  constructor() {
    this.serviceConfigs.set("1", { freeTierLimit: 3 });
    this.serviceConfigs.set("2", { freeTierLimit: 3 });
    this.serviceConfigs.set("3", { freeTierLimit: 3 });
  }

  // --- Free tier ---

  getServiceConfig(serviceId: string): { freeTierLimit: number } | undefined {
    return this.serviceConfigs.get(serviceId);
  }

  getFreeTierUsage(wallet: string, serviceId: string): number {
    return this.freeTierUsage.get(`${wallet}:${serviceId}`) || 0;
  }

  incrementFreeTier(wallet: string, serviceId: string): void {
    const key = `${wallet}:${serviceId}`;
    this.freeTierUsage.set(key, (this.freeTierUsage.get(key) || 0) + 1);
  }

  // --- Payments ---

  recordPayment(record: PaymentRecord): void {
    this.payments.push(record);
  }

  getPaymentsByWallet(wallet: string): PaymentRecord[] {
    return this.payments.filter((p) => p.wallet === wallet);
  }

  hasWalletPaid(wallet: string, serviceId: string): boolean {
    return this.payments.some((p) => p.wallet === wallet && p.serviceId === serviceId);
  }

  // --- Metrics ---

  recordMetric(serviceId: string, responseTimeMs: number, success: boolean): void {
    const m = this.metrics.get(serviceId) || { total: 0, success: 0, fail: 0, totalMs: 0 };
    m.total++;
    if (success) m.success++;
    else m.fail++;
    m.totalMs += responseTimeMs;
    this.metrics.set(serviceId, m);
  }

  getMetrics(serviceId: string): MetricsData {
    const m = this.metrics.get(serviceId) || { total: 0, success: 0, fail: 0, totalMs: 0 };
    return {
      totalRequests: m.total,
      successCount: m.success,
      failCount: m.fail,
      totalResponseTimeMs: m.totalMs,
      successRate: m.total > 0 ? ((m.success / m.total) * 100).toFixed(1) + "%" : "N/A",
      avgResponseTimeMs: m.total > 0 ? Math.round(m.totalMs / m.total) : 0,
    };
  }
}

export const db = new InMemoryDB();
