# backend/ — Express x402 Server Context

> **For AI agents:** Read this before editing any file in this folder.

## What This Folder Does

Express.js server that acts as a **PROXY** between consumers and AI providers. It:
1. Gates AI endpoints behind x402 MUSD paywalls
2. Provides free trial routes (no payment needed)
3. Calls external AI APIs (Groq, HuggingFace) and returns results
4. Tracks payments, free tier usage, and quality metrics in a local database
5. Serves the x402 paywall UI to browsers automatically

## Architecture

```
Consumer request
    │
    ▼
Express Server
    │
    ├── GET /api/services              (free — list all from contract)
    ├── GET /api/service/:id/try       (free tier — no x402, limited per wallet)
    ├── GET /api/service/:id           (paid — x402 MUSD paywall)
    ├── POST /api/battle               (paid — compare multiple services)
    ├── GET /api/metrics/:id           (free — quality metrics)
    └── POST /api/provider/register    (info — registration guide)
```

## Payment Flow (Critical to Understand)

### Paid Route (`/api/service/:id`)
1. Consumer's browser/agent hits the endpoint
2. `@x402/express` middleware intercepts, returns HTTP 402 with payment requirements
3. Browser: x402 paywall UI renders (wallet connect + pay button)
   Agent: `@x402/fetch` auto-signs payment
4. Consumer retries with `PAYMENT-SIGNATURE` header
5. Middleware verifies via facilitator (`https://facilitator.vativ.io/`)
6. Facilitator settles MUSD transfer on-chain (consumer → CapCipCup wallet)
7. Request reaches the route handler
8. Handler calls external AI API (Groq/HuggingFace)
9. Handler returns AI result to consumer

### Free Route (`/api/service/:id/try`)
1. Consumer hits the endpoint with `x-wallet-address` header (or no wallet needed)
2. `freeTierMiddleware` checks usage count in database
3. If under limit → serve directly, increment counter
4. If over limit → return 402 with redirect to paid endpoint

## Key Files

### `server.ts`
Main entry point. Sets up Express, registers middleware, starts listening.
- Port: 3000 (configurable via PORT env)
- CORS enabled for frontend (localhost:3001)
- x402 paywall created with `createPaywall().withNetwork(evmPaywall).build()`

### `middleware/x402Payment.ts`
Configures `@x402/express` paymentMiddleware for paid routes.
- `payTo`: CapCipCup wallet address (EVM_ADDRESS env var)
- `network`: `eip155:31611` (Mezo Testnet, CAIP-2 format)
- `price`: dynamic per service, read from contract/config
- `facilitator`: `https://facilitator.vativ.io/`

### `middleware/freeTier.ts`
Checks if wallet has remaining free requests for a service.
- Reads `freeTierLimit` from ServiceRegistry contract (cached)
- Tracks usage in SQLite database (wallet → serviceId → count)
- Returns 402-like response when exhausted

### `services/aiProviders.ts`
Proxy logic for calling external AI APIs.
- Each AI service has: id, name, provider (groq/huggingface), model, endpoint
- `callProvider(serviceId, input)` → calls the right API, returns result
- Measures response time for quality metrics

### `db/database.ts`
SQLite database for tracking:
- Free tier usage per wallet per service
- Payment history (wallet, serviceId, amount, txHash, timestamp)
- Quality metrics per service (response times, success/fail counts)

## Environment Variables

```env
# Required
EVM_ADDRESS=0x...              # CapCipCup receiving wallet address
PRIVATE_KEY=0x...              # Same wallet's private key (for contract interactions)

# AI Provider Keys (at least one required)
GROQ_API_KEY=gsk_...           # Free tier available at console.groq.com
HUGGINGFACE_API_KEY=hf_...     # Free tier available at huggingface.co

# Contract Addresses (from deployment)
SERVICE_REGISTRY_ADDRESS=0x...
AGENT_VAULT_ADDRESS=0x...
REVIEW_SYSTEM_ADDRESS=0x...

# Optional
PORT=3000
FACILITATOR_URL=https://facilitator.vativ.io/
FRONTEND_URL=http://localhost:3001
```

## x402 SDK Specifics

### Packages
```
@x402/express    — Express middleware for sellers
@x402/paywall    — Browser wallet-connect UI
@x402/evm        — EVM scheme handler (Mezo support)
@x402/core       — Core protocol types
```

### CRITICAL: Version >= 2.11.0
Earlier versions don't support MUSD (18 decimals). Add overrides to package.json:
```json
"pnpm": {
  "overrides": {
    "@x402/paywall": "^2.11.0",
    "@x402/evm": "^2.11.0"
  }
}
```

### CRITICAL: Network must be CAIP-2 format
Use `eip155:31611` NOT `mezo-testnet` or bare `31611`.

### CRITICAL: Price format
x402 prices are dollar strings: `"$0.005"` not `0.005` or `5000000000000000`.

## AI Provider Integration

### Groq (Primary — fast, free tier)
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.1-8b-instant` (fast) or `llama-3.3-70b-versatile` (quality)
- Auth: `Authorization: Bearer ${GROQ_API_KEY}`
- Free tier: generous, no credit card needed

### HuggingFace Inference (Backup)
- Endpoint: `https://api-inference.huggingface.co/models/{model}`
- Auth: `Authorization: Bearer ${HUGGINGFACE_API_KEY}`
- Free tier available

## How to Run

```bash
cd backend
pnpm install
cp .env.example .env  # Fill in values
pnpm dev              # Starts on port 3000
```

### Test x402 payment
```bash
# Should return 402
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/service/1

# Open in browser to see paywall UI
# http://localhost:3000/api/service/1
```

## Gotchas

1. **x402 paywall only renders in browsers.** `curl` gets JSON 402 response. Browsers get HTML paywall UI.
2. **Facilitator must be reachable.** If `facilitator.vativ.io` is down, ALL payments fail.
3. **payTo must be valid hex.** `0x` + 40 hex characters. No ENS names.
4. **CORS matters.** Frontend runs on different port. Enable CORS for frontend origin.
5. **Two separate wallets recommended.** One for receiving payments (EVM_ADDRESS), one for deploying/interacting with contracts (PRIVATE_KEY). Can be same for hackathon.
