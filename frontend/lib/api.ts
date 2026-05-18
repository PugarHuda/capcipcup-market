const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export interface ServiceListItem {
  id: string;
  name: string;
  provider: string;
  model: string;
  priceMusd: string;
  freeTierLimit: number;
  metrics: {
    totalRequests: number;
    successRate: string;
    avgResponseTimeMs: number;
  };
}

export interface InferenceResponse {
  serviceId: string;
  output: string;
  model: string;
  responseTimeMs: number;
  paidWith: string;
}

export async function fetchServices(): Promise<ServiceListItem[]> {
  const res = await fetch(`${BACKEND_URL}/api/services`);
  if (!res.ok) throw new Error("Failed to fetch services");
  const data = await res.json();
  return data.services;
}

export async function tryServiceFree(
  serviceId: string,
  input: string,
  walletAddress?: string
): Promise<InferenceResponse> {
  const headers: Record<string, string> = {};
  if (walletAddress) {
    headers["x-wallet-address"] = walletAddress;
  }

  const res = await fetch(
    `${BACKEND_URL}/api/service/${serviceId}/try?input=${encodeURIComponent(input)}`,
    { headers }
  );

  if (res.status === 402) {
    const data = await res.json();
    throw new Error(data.error || "Free tier exhausted. Please use the paid endpoint.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchMetrics(serviceId: string) {
  const res = await fetch(`${BACKEND_URL}/api/metrics/${serviceId}`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}
