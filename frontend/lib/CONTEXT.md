# frontend/lib/ — Utility Libraries & Config

> **For AI agents:** Shared utilities, blockchain config, API clients, and contract ABIs.

## Files

### wagmi.ts
Wagmi v2 config for Mezo Testnet.
- Defines `mezoTestnet` chain: ID 31611, BTC native currency, RPC `https://rpc.test.mezo.org`
- Creates wagmi config with `injected()` connector (MetaMask, Rabby)
- Exported as `wagmiConfig` — used in `app/providers.tsx`

### contracts.ts
Contract addresses and minimal ABIs for frontend use.
- `CONTRACT_ADDRESSES` — reads from `NEXT_PUBLIC_*` env vars
- `MUSD_ADDRESS` — `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`
- Minimal ABIs for: AgentVault, ServiceRegistry, ReviewSystem, ERC20
- ABIs only include functions needed by the frontend (not full compilation output)
- After compiling contracts, you can replace with full ABIs from `contracts/artifacts/`

### api.ts
Backend API client functions.
- `fetchServices()` → GET `/api/services` → list of services with metrics
- `tryServiceFree(serviceId, input, wallet?)` → GET `/api/service/:id/try` → inference result
- `fetchMetrics(serviceId)` → GET `/api/metrics/:id` → quality metrics
- All functions use `NEXT_PUBLIC_BACKEND_URL` env var (default: `http://localhost:3000`)
- Handles 402 responses gracefully (free tier exhausted message)

## Adding Utilities
- Keep files focused: one concern per file
- Export types alongside functions
- Use `NEXT_PUBLIC_` prefix for env vars that need client-side access
- For contract reads, use wagmi `useReadContract` hook in components — don't fetch here
