# backend/ — Express.js Serverless API Context

> **For AI agents:** Read this before editing any file in this folder.

## What This Folder Does

Express.js server deployed as a Vercel Serverless Function. It acts as a **PROXY** between consumers and AI providers:
1. Lists available AI services with real-time metrics
2. Provides free trial (3 requests per wallet per service)
3. Verifies MUSD payments ON-CHAIN before serving paid requests
4. Calls OpenRouter AI APIs and returns results
5. Tracks all state persistently in Upstash Redis
6. Calls markAsBuyer on ReviewSystem after verified payments

## Architecture

```
Consumer request
    │
    ▼
Express Server (api/index.ts)
    │
    ├── GET /                           (info — API metadata)
    ├── GET /health                     (health — persistence/verification status)
    ├── GET /api/services               (list all services + metrics from Redis)
    ├── GET /api/service/:id/try        (free tier — 3 per wallet, tracked in Redis)
    ├── POST /api/service/:id/paid      (paid — on-chain tx verification via Mezo RPC)
    ├── GET /api/metrics/:id            (per-service metrics from Redis)
    └── GET /api/stats                  (marketplace-wide stats)
```

## Payment Verification Flow (Critical)

```
1. Frontend triggers MUSD ERC20 transfer (wallet → PAYMENT_RECEIVER)
2. Frontend calls POST /api/service/:id/paid with { input, txHash, payer }
3. Backend checks:
   a. txHash format (0x + 64 hex chars)
   b. payer format (0x + 40 hex chars)
   c. txHash not already used (Redis SET)
   d. ON-CHAIN: fetch tx receipt via viem publicClient
   e. Decode Transfer event logs from MUSD contract
   f. Verify: from=payer, to=PAYMENT_RECEIVER, amount>=service price
4. If valid:
   - Mark txHash as used in Redis
   - Call markAsBuyer(payer, serviceId) on ReviewSystem
   - Run AI inference
   - Return result
5. If invalid:
   - Return 402 with detailed error
```

## Key File: `api/index.ts`

This is a **single-file backend** containing all logic (optimized for Vercel Serverless):

| Section | Lines | Purpose |
|---------|-------|---------|
| Imports & setup | 1-25 | Express, cors, viem, chain config |
| Chain config | 27-49 | Mezo Testnet definition, publicClient, walletClient |
| Contract addresses | 51-58 | MUSD, PAYMENT_RECEIVER, REVIEW_SYSTEM |
| Redis init | 60-73 | Upstash Redis with lazy initialization |
| Persistent storage | 75-177 | get/incr free tier, metrics, payments, rate limit |
| On-chain verification | 183-237 | verifyPaymentOnChain() |
| markAsBuyer | 239-253 | callMarkAsBuyer() via walletClient |
| Service configs | 255-299 | 6 services with model/prompt/price |
| OpenRouter call | 301-336 | callOpenRouter() |
| Routes | 338-567 | All HTTP endpoints |

## Dependencies

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "viem": "^2.31.0",
  "@upstash/redis": "^1.34.3",
  "typescript": "^5.8.3"
}
```

## State Management (Redis)

| Key Pattern | Type | Purpose |
|-------------|------|---------|
| `freetier:{wallet}:{serviceId}` | STRING (counter) | Free tier usage per wallet/service |
| `metrics:{serviceId}` | HASH (total, success, totalMs) | Per-service quality metrics |
| `verified_payments` | SET | All used txHashes (prevents replay) |
| `ratelimit:{ip}` | STRING (counter, 60s TTL) | Rate limit per IP |

Fallback: If Redis env vars are not set, uses in-memory Maps (resets on cold start).

## AI Provider: OpenRouter

- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Auth: `Authorization: Bearer ${OPENROUTER_API_KEY}`
- Models (all free tier):
  - `openai/gpt-oss-120b:free` — GPT-class, best quality
  - `nvidia/nemotron-3-super-120b-a12b:free` — Hybrid MoE, fast
  - `deepseek/deepseek-v4-flash:free` — Code-focused, reasoning model
- Max tokens: 300
- Temperature: 0.3

## Environment Variables

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-...         # AI provider
PRIVATE_KEY=0x...                        # Wallet for markAsBuyer (must be proxy on ReviewSystem)
PAYMENT_RECEIVER=0xdbE1a6F...            # Address receiving MUSD payments
REVIEW_SYSTEM_ADDRESS=0xa5F1d...         # ReviewSystem contract address
MUSD_ADDRESS=0x118917a...                # MUSD token address

# Persistence (required for production)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Optional
EVM_ADDRESS=0x...                        # Info only
FACILITATOR_URL=https://facilitator.vativ.io/
```

## Deployment

Deployed on Vercel as a serverless function:
- Project: `capcipcup-api`
- URL: `https://capcipcup-api.vercel.app`
- Build: `vercel.json` with `builds: [{ src: "api/index.ts", use: "@vercel/node" }]`
- Install: `npm install` (not pnpm — Vercel compatibility)

### Deploy manually:
```bash
cd backend
npx vercel deploy --prod
```

## How to Run Locally

```bash
cd backend
npm install
cp ../.env.example .env  # Fill in values
npx tsx api/index.ts     # Or: npm run dev
```

Server starts on port 3000.

## Gotchas

1. **Single file**: All logic is in `api/index.ts` for Vercel Serverless compatibility (no multi-file imports in serverless)
2. **npm not pnpm**: Backend uses npm + package-lock.json to avoid Vercel build issues
3. **viem for on-chain**: Uses viem publicClient for tx receipt fetching and walletClient for markAsBuyer
4. **Redis lazy init**: `initRedis()` is called on first request, not at module load (Vercel cold start optimization)
5. **CORS**: Allows all `.vercel.app` origins plus localhost for development
6. **Rate limit per IP**: Uses `x-forwarded-for` header (Vercel provides this)
