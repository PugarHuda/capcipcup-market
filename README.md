# CapCipCup Market

**AI Inference Marketplace on Mezo — Pay per request with Bitcoin-backed MUSD via x402.**

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
- **x402 protocol** for HTTP-native MUSD micropayments (zero gas for buyers)
- **On-chain service registry** where providers stake MEZO to list services
- **AgentVault** smart contract for AI agents to spend MUSD autonomously within daily limits
- **Marketplace UI** for discovering, comparing, and consuming AI services
- **Multi-model support** with different AI providers and pricing tiers

## How It Works

```
PROVIDER (owns AI model)              CONSUMER (human or AI agent)
    │                                      │
    ├── Stake MEZO to register             ├── Browse marketplace
    ├── Set price per request              ├── Try free (3 requests)
    ├── Service goes live                  ├── Pay per request (MUSD)
    │                                      │
    │          ┌──────────────┐            │
    └─────────►│  CapCipCup   │◄───────────┘
               │  Proxy + x402│
               │  (zero gas)  │
               └──────────────┘
                     │
              Provider gets MUSD
              Consumer gets AI result
              All on Mezo testnet
```

### For Human Users
1. Open marketplace → browse AI services with search/filter
2. Click "Try Free" → get result without wallet
3. After free tier exhausted → connect wallet → transfer MUSD → get result
4. Leave on-chain reviews (1-5 stars) for services used

### For AI Agents
1. Owner deposits MUSD into AgentVault smart contract
2. Sets daily spending limit (e.g., 10 MUSD/day)
3. Agent's hot wallet is approved as operator
4. Agent auto-calls `requestFunds` from vault → transfers MUSD → gets AI results
5. All spending constrained by smart contract limits

## Features

### Core
- 6 AI services across multiple models (GPT-OSS 120B, Nemotron 3 Super, DeepSeek V4)
- Real ERC20 MUSD payment flow with on-chain verification
- Free tier: 3 requests per wallet per service
- On-chain service registry with MEZO staking
- Agent Vault with daily spending limits and operator management

### Frontend
- Polished landing page with hero section, how-it-works steps
- Service discovery with search/filter and sort (popular, fastest, cheapest)
- Playground with free tier + paid MUSD payments
- On-chain review system (1-5 stars + comments)
- Provider dashboard (register, view, delist services)
- Agent Vault dashboard (deposit, withdraw, set limits, manage operators)
- Analytics page with marketplace-wide stats
- Token balance display + testnet faucet (mint MUSD/MEZO)
- Toast notifications for all transactions with explorer links
- Mobile responsive with hamburger navigation
- WalletConnect + injected wallet support

### Smart Contracts (Mezo Testnet)
- `ServiceRegistry.sol` — Register/delist services, MEZO staking
- `AgentVault.sol` — Deposit/withdraw MUSD, daily limits, operator management
- `ReviewSystem.sol` — Verified buyer reviews (1-5 score + comment)
- `MockMEZO.sol` — Testnet token with open mint

### Backend
- Express.js serverless API on Vercel
- OpenRouter AI integration (6 models)
- Free tier tracking per wallet
- Paid endpoint with tx hash verification (no double-spend)
- Metrics and analytics endpoints
- Full CORS support

### Agent
- Autonomous "NewsBot" agent that calls services on interval
- Real on-chain payment flow: vault → transfer → API
- Demonstrates machine-to-machine MUSD payments

## Architecture

```
capcipcup/
├── contracts/          # Solidity smart contracts (Hardhat + Mezo Testnet)
│   ├── ServiceRegistry.sol    — Provider registration + MEZO staking
│   ├── AgentVault.sol         — MUSD vault + daily limits for agents
│   ├── ReviewSystem.sol       — Verified buyer reviews
│   └── MockMEZO.sol           — Testnet token
│
├── backend/            # Express.js serverless API (Vercel)
│   └── api/index.ts    — Routes, AI proxy, payments, metrics
│
├── frontend/           # Next.js 15 marketplace UI (Vercel)
│   ├── app/             — Pages (explore, service, vault, provider, analytics)
│   ├── components/      — Header, ServiceGrid, Playground, ReviewSection, Toast
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
| Backend | Node.js, Express 5, TypeScript, Vercel Serverless |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, wagmi 2 + viem 2 |
| Payments | x402 protocol, MUSD ERC20 transfers, AgentVault |
| AI Models | OpenRouter (GPT-OSS 120B, Nemotron 3 Super, DeepSeek V4 Flash) |
| Wallets | MetaMask, Rabby, WalletConnect |
| Hosting | Vercel (frontend + backend) |

## Key Addresses (Mezo Testnet)

| Contract | Address |
|----------|---------|
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| ServiceRegistry | `0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c` |
| AgentVault | `0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1` |
| ReviewSystem | `0xa5F1d1781bB50B41434E2f507667e22De3Df27a9` |
| MockMEZO | `0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed` |

| Infra | Value |
|-------|-------|
| RPC | `https://rpc.test.mezo.org` |
| Explorer | `https://explorer.test.mezo.org` |
| Chain ID | `31611` |
| x402 Facilitator | `https://facilitator.vativ.io/` |

## Hackathon Compliance

| Requirement | How We Meet It |
|-------------|---------------|
| Integrate MUSD | x402 payments, AgentVault deposits, provider earnings — all in MUSD |
| Integrate MEZO | Providers stake MEZO to register services on-chain |
| Testnet demo | All contracts deployed and functional on Mezo Testnet |
| MUSD Track fit | "Consumer experiences where MUSD powers payments and everyday apps" |
| Working product | Live at capcipcup-market.vercel.app with real AI inference |

## Roadmap Alignment

Mezo's 2026 roadmap explicitly states:

> "AI-Ready Infrastructure — Mezo will explore infrastructure that better supports AI-agent interactions, including payment rails, agent-compatible endpoints, and tooling for autonomous transactions on the network. MUSD is well positioned to serve as a transaction and settlement asset in that environment."

CapCipCup builds exactly this: a marketplace infrastructure where AI agents discover, consume, and pay for services with MUSD.

## Unique Differentiators

1. **Zero gas for buyers** — Mezo x402 facilitator pays gas. No BTC needed to consume.
2. **Free trial system** — First 3 requests free per wallet. No wallet needed to try.
3. **AgentVault** — Smart contract spending controls for autonomous AI agents.
4. **MEZO staking** — Providers stake MEZO to register. Skin in the game.
5. **Verified reviews** — Only wallets that used a service can review. No fake reviews.
6. **Multi-model marketplace** — Different AI models at different price points.
7. **Real payments** — Actual ERC20 MUSD transfers verified on-chain.
8. **Bitcoin-native settlement** — MUSD backed by BTC, not fiat.

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- MetaMask, Rabby, or any WalletConnect-compatible wallet
- Mezo Testnet BTC (from faucet) for gas

### Install & Run

```bash
# Clone
git clone https://github.com/PugarHuda/capcipcup-market.git
cd capcipcup-market

# Backend
cd backend && pnpm install && pnpm dev

# Frontend (new terminal)
cd frontend && pnpm install && pnpm dev

# Agent (optional)
cd agent && pnpm install && pnpm start
```

### Environment Variables

**Backend (.env)**
```
OPENROUTER_API_KEY=sk-or-v1-...
EVM_ADDRESS=0x...
PRIVATE_KEY=0x...
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_BACKEND_URL=https://capcipcup-api.vercel.app
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS=0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c
NEXT_PUBLIC_AGENT_VAULT_ADDRESS=0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=0xa5F1d1781bB50B41434E2f507667e22De3Df27a9
NEXT_PUBLIC_MOCK_MEZO_ADDRESS=0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services with metrics |
| GET | `/api/service/:id/try?input=...` | Free tier inference |
| GET | `/api/service/:id?input=...` | Paid inference (legacy) |
| POST | `/api/service/:id/paid` | Paid inference with tx hash proof |
| GET | `/api/metrics/:id` | Service metrics |
| GET | `/api/stats` | Marketplace-wide analytics |
| GET | `/health` | Health check |

## License

MIT
