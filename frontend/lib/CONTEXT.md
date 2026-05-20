# frontend/lib/ — Shared Libraries Context

## Files

### `wagmi.ts`
Wagmi configuration for Mezo Testnet:
- Chain definition: id=31611, BTC native currency, rpc.test.mezo.org
- Connectors: injected (MetaMask, Rabby) + WalletConnect (optional, needs NEXT_PUBLIC_WC_PROJECT_ID)
- Transport: HTTP to Mezo Testnet RPC

### `contracts.ts`
Contract addresses and ABIs:
- `CONTRACT_ADDRESSES` — reads from `NEXT_PUBLIC_*` env vars
- `MUSD_ADDRESS` — MUSD token address
- `ERC20_ABI` — Standard ERC20 (balanceOf, transfer, approve, allowance, mint)
- `SERVICE_REGISTRY_ABI` — register, delist, getServicesByOwner, serviceCount
- `AGENT_VAULT_ABI` — deposit, withdraw, setDailyLimit, approveOperator, revokeOperator, getVaultInfo
- `REVIEW_SYSTEM_ABI` — rate, getReviews, getAverageScore

### `api.ts`
Backend API client functions:
- `fetchServices()` — GET /api/services → ServiceListItem[]
- `tryServiceFree(serviceId, input, walletAddress?)` — GET /api/service/:id/try
- `fetchMetrics(serviceId)` — GET /api/metrics/:id

All functions use `NEXT_PUBLIC_BACKEND_URL` for the base URL.

## Key Types

```typescript
interface ServiceListItem {
  id: string;
  name: string;
  provider: string;
  model: string;
  category?: string;
  priceMusd: string;
  freeTierLimit: number;
  metrics: { totalRequests: number; successRate: string; avgResponseTimeMs: number; };
}

interface InferenceResponse {
  serviceId: string;
  output: string;
  model: string;
  responseTimeMs: number;
  paidWith: string;
}
```
