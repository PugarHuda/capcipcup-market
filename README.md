# CapCipCup Market

**AI Inference Marketplace on Mezo — Pay per request with Bitcoin-backed MUSD.**

> Built for the **Mezo Hackathon 2026** (MUSD Track)

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend | [capcipcup-market.vercel.app](https://capcipcup-market.vercel.app) |
| Backend API | [capcipcup-api.vercel.app](https://capcipcup-api.vercel.app) |
| GitHub | [github.com/PugarHuda/capcipcup-market](https://github.com/PugarHuda/capcipcup-market) |

## What Is This?

CapCipCup is a marketplace where anyone can sell AI services (text summarization, code review, sentiment analysis, translation, etc.) and anyone can consume them by paying per-request with MUSD — Mezo's Bitcoin-backed stablecoin.

**No subscriptions. No API keys. No gas fees for buyers.**

## The Problem

AI services today require credit cards, subscriptions, and accounts. AI agents that operate autonomously can't sign up for OpenAI with a Visa. There's no decentralized marketplace where AI services are discoverable, payable per-use, and settled in Bitcoin-native currency.

## The Solution

CapCipCup combines:
- **MUSD micropayments** for HTTP-native per-request payments (zero gas for buyers)
- **On-chain service registry** where providers stake MEZO to list services
- **AgentVault** smart contract for AI agents to spend MUSD autonomously within daily limits
- **Real on-chain payment verification** — backend verifies actual MUSD Transfer events on Mezo Testnet
- **Persistent state via Upstash Redis** — free tier, metrics, rate limits survive serverless cold starts
- **Multi-model marketplace** with different AI providers and pricing tiers

## How It Works

```
PROVIDER (owns AI model)              CONSUMER (human or AI agent)
    │                                      │
    ├── Stake MEZO to register             ├── Browse marketplace
    ├── Set price per request              ├── Try free (3 requests)
    ├── Service goes live                  ├── Pay MUSD per request
    │                                      │
    │          ┌──────────────────┐        │
    └─────────►│   CapCipCup API  │◄───────┘
               │  On-chain verify │
               │  + AI inference  │
               └──────────────────┘
                       │
                Provider gets MUSD
                Consumer gets AI result
                All verified on Mezo Testnet
```

### For Human Users
1. Open marketplace → browse AI services with search/filter/category
2. Click "Try Free" → get result without wallet (3 free per service)
3. After free tier exhausted → connect wallet → transfer MUSD → get result
4. Leave on-chain reviews (1-5 stars) for services used
5. Compare services in Battle Mode

### For AI Agents
1. Owner deposits MUSD into AgentVault smart contract
2. Sets daily spending limit (e.g., 10 MUSD/day)
3. Agent's hot wallet is approved as operator
4. Agent auto-calls `requestFunds` from vault → transfers MUSD → gets AI results
5. All spending constrained by smart contract limits

## Features

### Core
- 6 AI services across 3 models (GPT-OSS 120B, Nemotron 3 Super 120B, DeepSeek V4 Flash)
- Real ERC20 MUSD payment flow with **on-chain transaction verification** via Mezo RPC
- Free tier: 3 requests per wallet per service (persistent via Redis)
- On-chain service registry with MEZO staking
- Agent Vault with daily spending limits and operator management
- Verified buyer reviews via `markAsBuyer` on-chain call after payment

### Backend Security & Infrastructure
- **On-chain payment verification**: Fetches transaction receipt, decodes ERC20 Transfer events, verifies from/to/amount
- **Duplicate payment prevention**: Redis SET tracks all used txHashes
- **Rate limiting**: 20 req/min per IP via Redis with 60s TTL
- **Input sanitization**: 5,000 char max per request
- **Persistent state**: Upstash Redis for free tier usage, metrics, rate limits (survives Vercel cold starts)
- **markAsBuyer integration**: After verified payment, backend calls ReviewSystem on-chain so buyer can leave reviews

### Frontend
- Service discovery with search, category filter (text/code/analysis), and sort (popular, fastest, cheapest)
- Playground with free tier + paid MUSD payments (real ERC20 transfer)
- On-chain review system (1-5 stars + comments, verified buyers only)
- Battle Mode — compare two AI services side-by-side
- Provider dashboard (register, view, delist services with MEZO staking)
- Agent Vault dashboard (deposit, withdraw, set limits, manage operators)
- Analytics page with marketplace-wide stats from Redis
- Token balance display + testnet faucet (mint MUSD/MEZO)
- Toast notifications for all transactions with Mezo Explorer links
- Mobile responsive with hamburger navigation
- Custom 404 page and error boundary
- SEO meta tags (OpenGraph, Twitter Card)
- WalletConnect + injected wallet support (MetaMask, Rabby)

### Smart Contracts (Mezo Testnet)
- `ServiceRegistry.sol` — Register/delist services, MEZO staking
- `AgentVault.sol` — Deposit/withdraw MUSD, daily limits, operator management
- `ReviewSystem.sol` — Verified buyer reviews (1-5 score + comment, markAsBuyer gate)
- `MockMEZO.sol` — Testnet token with open mint (simulates real MEZO)

### Backend
- Express.js serverless API on Vercel
- OpenRouter AI integration (3 models, 6 services)
- Real on-chain payment verification via viem + Mezo RPC
- Persistent state via Upstash Redis
- Rate limiting (20 req/min/IP)
- markAsBuyer on-chain call after verified payment
- Input sanitization (5,000 char limit)
- Full CORS support for frontend domain

## Architecture

```
capcipcup-market/
├── contracts/          # Solidity smart contracts (Hardhat + Mezo Testnet)
│   ├── ServiceRegistry.sol    — Provider registration + MEZO staking
│   ├── AgentVault.sol         — MUSD vault + daily limits for agents
│   ├── ReviewSystem.sol       — Verified buyer reviews
│   └── MockMEZO.sol           — Testnet ERC20 token
│
├── backend/            # Express.js serverless API (Vercel)
│   ├── api/index.ts    — Routes, AI proxy, on-chain verification, Redis state
│   ├── package.json    — Dependencies (express, viem, @upstash/redis)
│   └── vercel.json     — Serverless function config
│
├── frontend/           # Next.js 15 marketplace UI (Vercel)
│   ├── app/             — Pages (explore, service, vault, provider, analytics, battle)
│   ├── components/      — Header, Footer, ServiceGrid, Playground, ReviewSection, Toast
│   └── lib/             — Contract ABIs, wagmi config, API client
│
└── agent/              # Autonomous agent demo
    └── autopilot.ts     — NewsBot with real MUSD payments via AgentVault
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Hardhat, OpenZeppelin |
| Blockchain | Mezo Testnet (chain 31611, EVM-compatible, BTC gas) |
| Backend | Node.js, Express 5, TypeScript, viem 2, Vercel Serverless |
| State | Upstash Redis (persistent free tier, metrics, rate limits, payments) |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, wagmi 2 + viem 2 |
| Payments | MUSD ERC20 transfers + on-chain verification via Mezo RPC |
| AI Models | OpenRouter (GPT-OSS 120B, Nemotron 3 Super 120B, DeepSeek V4 Flash) |
| Wallets | MetaMask, Rabby, WalletConnect |
| Hosting | Vercel (frontend + backend serverless) |

## Key Addresses (Mezo Testnet)

| Contract | Address |
|----------|---------|
| MUSD (MockMEZO) | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| ServiceRegistry | `0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c` |
| AgentVault | `0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1` |
| ReviewSystem | `0xa5F1d1781bB50B41434E2f507667e22De3Df27a9` |
| MockMEZO (Staking) | `0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed` |
| Payment Receiver | `0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb` |

| Infra | Value |
|-------|-------|
| RPC | `https://rpc.test.mezo.org` |
| Explorer | `https://explorer.test.mezo.org` |
| Chain ID | `31611` |

## Hackathon Compliance

| Requirement | How We Meet It |
|-------------|---------------|
| Integrate MUSD | Real ERC20 MUSD payments verified on-chain, AgentVault deposits, provider earnings |
| Integrate MEZO | Providers stake MEZO to register services on ServiceRegistry |
| Testnet demo | All 4 contracts deployed and functional on Mezo Testnet |
| MUSD Track fit | "Consumer experiences where MUSD powers payments and everyday apps" |
| Working product | Live at capcipcup-market.vercel.app with real AI inference and payments |
| Security | On-chain verification prevents payment fraud, Redis prevents replay attacks |

## Security Model

| Attack Vector | Protection |
|---------------|-----------|
| Fake payment (random txHash) | On-chain verification via Mezo RPC — checks Transfer event logs |
| Replay attack (reuse txHash) | Redis SET `verified_payments` — rejects duplicates |
| Rate abuse | 20 req/min per IP via Redis INCR + 60s EXPIRE |
| Input injection | 5,000 char limit + trim |
| Fake reviews | markAsBuyer only called after verified payment — only real buyers can review |
| Cold start state loss | Upstash Redis persists all state across Vercel serverless instances |

## Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- MetaMask, Rabby, or any EVM wallet
- Mezo Testnet BTC for gas (from faucet)

### Install & Run

```bash
# Clone
git clone https://github.com/PugarHuda/capcipcup-market.git
cd capcipcup-market

# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && pnpm install && pnpm dev
```

### Environment Variables

**Backend (.env)**
```
OPENROUTER_API_KEY=sk-or-v1-...
PRIVATE_KEY=0x...  (for markAsBuyer on-chain calls)
PAYMENT_RECEIVER=0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb
REVIEW_SYSTEM_ADDRESS=0xa5F1d1781bB50B41434E2f507667e22De3Df27a9
MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_BACKEND_URL=https://capcipcup-api.vercel.app
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS=0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c
NEXT_PUBLIC_AGENT_VAULT_ADDRESS=0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=0xa5F1d1781bB50B41434E2f507667e22De3Df27a9
NEXT_PUBLIC_MOCK_MEZO_ADDRESS=0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed
NEXT_PUBLIC_PAYMENT_RECEIVER=0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check (persistence, verification status) |
| GET | `/api/services` | List all services with real-time metrics |
| GET | `/api/service/:id/try?input=...` | Free tier inference (3 per wallet) |
| POST | `/api/service/:id/paid` | Paid inference with on-chain tx verification |
| GET | `/api/metrics/:id` | Per-service metrics |
| GET | `/api/stats` | Marketplace-wide analytics |

## QA Status

Full QA report available in [`QA_REPORT.md`](./QA_REPORT.md).

**37/37 tests passing** across backend API, frontend pages, smart contracts, security, and integration.

## License

MIT
