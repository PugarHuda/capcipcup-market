# CONTEXT.md — Global Project Context for AI Agents

> **Purpose:** This file provides full context for any AI agent working on this codebase. Read this FIRST before touching any code.

## Project Identity

- **Name:** CapCipCup Market
- **Type:** AI Inference Marketplace with MUSD micropayments
- **Hackathon:** Mezo Hackathon 2026 (April 13 – May 25, 2026)
- **Track:** MUSD Track (consumer experiences powered by Bitcoin-backed MUSD)
- **Deadline:** May 25, 2026
- **Status:** Production — deployed and live
- **Frontend:** https://capcipcup-market.vercel.app
- **Backend:** https://capcipcup-api.vercel.app

## What This Project Does (Plain English)

CapCipCup is a marketplace where:
- **Providers** register AI services (summarization, translation, code review, etc.) by staking MEZO tokens
- **Consumers** (humans or AI agents) browse services, try them for free (3x), then pay per-request with MUSD
- **Payments** are real ERC20 MUSD transfers on Mezo Testnet, verified on-chain by the backend
- **CapCipCup acts as a PROXY** — it verifies MUSD payment on-chain, calls the AI provider API, and returns the result

## Critical Technical Facts

### Payment Model (CURRENT Implementation)
```
1. Consumer sends MUSD to PAYMENT_RECEIVER via ERC20 transfer (frontend triggers wallet tx)
2. Consumer gets txHash from wallet
3. Consumer calls POST /api/service/:id/paid with { input, txHash, payer }
4. Backend fetches tx receipt from Mezo RPC (rpc.test.mezo.org)
5. Backend decodes Transfer event logs, verifies: from=payer, to=PAYMENT_RECEIVER, amount>=price
6. If valid: marks payment as used in Redis, calls markAsBuyer on ReviewSystem, runs AI inference
7. If invalid: returns 402 with verification failure details
```

This is NOT a naive txHash format check. It's full on-chain verification via viem.

### State Management (Backend)
All state is persisted in **Upstash Redis** (with in-memory fallback if Redis unavailable):
- `freetier:{wallet}:{serviceId}` — free tier usage counter
- `metrics:{serviceId}` — hash with total, success, totalMs
- `verified_payments` — SET of used txHashes (prevents replay)
- `ratelimit:{ip}` — counter with 60s TTL

### Mezo Chain
- EVM-compatible (Solidity, Hardhat, Foundry all work)
- Native gas token: BTC (not ETH)
- Testnet RPC: `https://rpc.test.mezo.org`
- Chain ID: 31611 (testnet)
- Block explorer: `https://explorer.test.mezo.org`

### Smart Contracts (Deployed & Verified Working)
| Contract | Address | Purpose |
|----------|---------|---------|
| MockMEZO (MUSD) | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` | ERC20 payment token |
| ServiceRegistry | `0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c` | Provider registration + MEZO staking |
| AgentVault | `0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1` | MUSD vault + daily limits for agents |
| ReviewSystem | `0xa5F1d1781bB50B41434E2f507667e22De3Df27a9` | Verified buyer reviews (markAsBuyer gate) |
| MockMEZO (Staking) | `0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed` | Token for staking on ServiceRegistry |

### AI Provider
- **OpenRouter** (`https://openrouter.ai/api/v1/chat/completions`)
- Models used:
  - `openai/gpt-oss-120b:free` — Services 1, 2, 3, 6
  - `nvidia/nemotron-3-super-120b-a12b:free` — Service 4
  - `deepseek/deepseek-v4-flash:free` — Service 5
- All free tier, no cost
- Max tokens: 300, temperature: 0.3

### Frontend Architecture
- Next.js 15 App Router
- Tailwind CSS (dark theme, Bitcoin orange #F7931A accent)
- wagmi v2 + viem v2 for wallet connection
- Connected to Mezo Testnet (chain 31611)
- Reads contract data via public RPC, writes via connected wallet
- Pages: /, /service/[id], /vault, /provider, /analytics, /battle

### Backend Architecture
- Express.js + TypeScript, deployed as Vercel Serverless Function
- Single file: `api/index.ts`
- Dependencies: express, cors, viem (on-chain verification), @upstash/redis (persistent state)
- Persists all state in Upstash Redis
- On-chain payment verification via viem publicClient
- markAsBuyer on-chain call via viem walletClient

## Design Decisions (Why We Did It This Way)

### Why direct MUSD transfer instead of x402 protocol?
x402 requires a facilitator service and complex SDK setup. Direct ERC20 transfer + on-chain verification is simpler, more robust, and doesn't depend on third-party facilitator uptime. The backend verifies real Transfer events on-chain — equally secure.

### Why Upstash Redis instead of Postgres/SQLite?
Vercel Serverless Functions are stateless — in-memory state resets on cold start. Redis provides persistence with minimal latency. Upstash offers free tier with REST API (no connection pooling needed). Perfect for: counters, sets, hashes.

### Why proxy model (not direct buyer→provider)?
By being the proxy, CapCipCup can: verify payments, track metrics, enforce rate limits, call markAsBuyer for reviews, and provide a consistent API regardless of the underlying AI provider.

### Why markAsBuyer from backend?
ReviewSystem.rate() requires the caller to be a verified buyer. The backend (as proxy/admin) calls markAsBuyer after verifying payment, enabling the buyer's wallet to then call rate() directly from the frontend.

### Why AgentVault drips MUSD to agent wallet instead of signing from vault?
Smart contracts can't sign EIP-712 messages for payments. The vault transfers MUSD to the agent's EOA wallet, which then makes normal transfers.

### Why mock tokens on testnet?
Real MEZO/MUSD may not be obtainable on testnet. MockMEZO with open mint is standard hackathon practice. On mainnet, contracts would use real token addresses.

## Constraints & Known Limitations

1. **Free tier models**: OpenRouter free models have shared rate limits and higher latency (15-25s)
2. **DeepSeek V4 Flash**: Sometimes returns empty output (spends token budget on reasoning)
3. **No WebSocket streaming**: AI responses are returned in full after completion
4. **WalletConnect**: Requires project ID env var to enable (works without, using MetaMask/Rabby)
5. **Testnet tokens**: MUSD and MEZO are mock tokens — mainnet would use real BTC-backed assets

## File Structure

```
capcipcup-market/
├── CONTEXT.md          # This file — global project context
├── README.md           # Project documentation for humans
├── QA_REPORT.md        # Comprehensive QA test results
├── SUBMISSION.md       # Hackathon submission text
├── .env.example        # Environment variable template
│
├── contracts/          # Solidity (Hardhat)
│   ├── contracts/      # .sol files
│   ├── scripts/        # Deploy scripts
│   └── test/           # Contract tests
│
├── backend/            # Express.js serverless API
│   ├── api/index.ts    # ALL backend logic (single file for Vercel)
│   ├── package.json    # deps: express, cors, viem, @upstash/redis
│   └── vercel.json     # Vercel function config
│
├── frontend/           # Next.js 15
│   ├── app/            # Pages (layout, page, service/[id], vault, provider, analytics, battle)
│   ├── components/     # UI components (Header, Footer, ServiceGrid, Playground, ReviewSection, Toast)
│   └── lib/            # Shared code (contracts.ts, wagmi.ts, api.ts)
│
└── agent/              # Autonomous agent demo
    └── autopilot.ts    # NewsBot with real MUSD payments
```

## Environment Variables

### Backend (Vercel: capcipcup-api)
```
OPENROUTER_API_KEY=sk-or-v1-...       # AI provider
PRIVATE_KEY=0x...                      # Wallet for markAsBuyer calls
PAYMENT_RECEIVER=0xdbE1a6F...          # Address that receives MUSD payments
REVIEW_SYSTEM_ADDRESS=0xa5F1d...       # ReviewSystem contract
MUSD_ADDRESS=0x118917a...              # MUSD token contract
UPSTASH_REDIS_REST_URL=https://...     # Redis for persistent state
UPSTASH_REDIS_REST_TOKEN=...           # Redis auth token
```

### Frontend (Vercel: capcipcup-market)
```
NEXT_PUBLIC_BACKEND_URL=https://capcipcup-api.vercel.app
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS=0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c
NEXT_PUBLIC_AGENT_VAULT_ADDRESS=0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=0xa5F1d1781bB50B41434E2f507667e22De3Df27a9
NEXT_PUBLIC_MOCK_MEZO_ADDRESS=0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed
NEXT_PUBLIC_PAYMENT_RECEIVER=0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb
```

## Coding Standards

- TypeScript everywhere (backend + frontend)
- Solidity 0.8.24 for contracts
- npm for backend, pnpm for frontend
- ESM modules
- No unnecessary comments — code should be self-documenting
- Error messages should be descriptive for debugging
- All sensitive state in Redis (not in-memory)
