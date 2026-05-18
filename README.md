# CapCipCup Market

**AI Inference Marketplace on Mezo — Pay per request with Bitcoin-backed MUSD via x402.**

## What Is This?

CapCipCup is a marketplace where anyone can sell AI services (text summarization, image description, sentiment analysis, etc.) and anyone can consume them by paying per-request with MUSD — Mezo's Bitcoin-backed stablecoin. No subscriptions, no API keys, no gas fees for buyers.

Built for the **Mezo Hackathon 2026** (MUSD Track).

## The Problem

AI services today require credit cards, subscriptions, and accounts. AI agents that operate autonomously can't sign up for OpenAI with a Visa. There's no decentralized marketplace where AI services are discoverable, payable per-use, and settled in Bitcoin-native currency.

## The Solution

CapCipCup combines:
- **x402 protocol** for HTTP-native MUSD micropayments (zero gas for buyers)
- **On-chain service registry** where providers stake MEZO to list services
- **AgentVault** smart contract for AI agents to spend MUSD autonomously within daily limits
- **Marketplace UI** for discovering, comparing, and consuming AI services

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
1. Open marketplace → browse AI services
2. Click "Try Free" → get result without wallet
3. After free tier → x402 paywall appears → connect wallet → pay MUSD → get result

### For AI Agents
1. Owner deposits MUSD into AgentVault smart contract
2. Sets daily spending limit (e.g., 10 MUSD/day)
3. Agent's hot wallet is approved as operator
4. Agent calls services via `@x402/fetch` → auto-signs MUSD payments → gets results
5. All spending constrained by smart contract limits

## Architecture

```
capcipcup/
├── contracts/          # Solidity smart contracts (Hardhat + Mezo Testnet)
│   ├── ServiceRegistry.sol    — Provider registration + MEZO staking
│   ├── AgentVault.sol         — MUSD vault + daily limits for agents
│   └── ReviewSystem.sol       — Verified buyer reviews
│
├── backend/            # Express.js + x402 payment server
│   ├── routes/         — API endpoints (paid + free tier)
│   ├── middleware/      — x402 paywall + free tier check
│   ├── services/        — AI provider proxy logic
│   └── server.ts        — Main server entry
│
├── frontend/           # Next.js 15 marketplace UI
│   ├── app/             — Pages (explore, service detail, vault, provider)
│   ├── components/      — Reusable UI components
│   └── lib/             — Contract ABIs, wagmi config, utils
│
└── agent/              # Autonomous agent demo script
    └── autopilot.ts     — NewsBot agent that spends MUSD autonomously
```

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Blockchain | Mezo Testnet (chain 31611, EVM-compatible, BTC gas) |
| Backend | Node.js, Express, TypeScript, `@x402/express` |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, wagmi + viem |
| Payments | x402 protocol, MUSD (permit2 + EIP-2612), zero gas via facilitator |
| AI Services | Groq API (free tier), Hugging Face Inference API |

## Key Addresses (Mezo Testnet)

| Asset | Address |
|---|---|
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| MEZO (native) | `0x7B7c000000000000000000000000000000000001` |
| x402 Facilitator | `https://facilitator.vativ.io/` |
| RPC | `https://rpc.test.mezo.org` |
| Explorer | `https://explorer.test.mezo.org` |
| Chain ID | `31611` |

## Hackathon Compliance

| Requirement | How We Meet It |
|---|---|
| Integrate MUSD | x402 payments, AgentVault deposits, provider earnings — all in MUSD |
| Integrate MEZO | Providers stake MEZO to register services on-chain |
| Testnet demo | All contracts deployed on Mezo Testnet (chain 31611) |
| MUSD Track fit | "Consumer experiences where MUSD powers payments and everyday apps" |

## Roadmap Alignment

Mezo's 2026 roadmap explicitly states:

> "AI-Ready Infrastructure — Mezo will explore infrastructure that better supports AI-agent interactions, including payment rails, agent-compatible endpoints, and tooling for autonomous transactions on the network. MUSD is well positioned to serve as a transaction and settlement asset in that environment."

CapCipCup builds exactly this: a marketplace infrastructure where AI agents discover, consume, and pay for services with MUSD.

## Unique Differentiators

1. **Zero gas for buyers** — Mezo x402 facilitator pays gas. No BTC needed to consume.
2. **Free trial system** — First N requests free per wallet. No wallet needed to try.
3. **AgentVault** — Smart contract spending controls for autonomous AI agents.
4. **MEZO staking** — Providers stake MEZO to register. Skin in the game.
5. **Verified reviews** — Only wallets that paid can review. No fake reviews.
6. **Objective quality metrics** — Response time, success rate measured by proxy.
7. **Battle mode** — Compare multiple AI services side-by-side with one payment.
8. **Bitcoin-native settlement** — MUSD backed by BTC, not fiat. Revenue stays in Bitcoin ecosystem.

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- MetaMask or Rabby wallet
- Mezo Testnet BTC (from faucet) + MUSD (borrow against BTC)

### Install & Run

```bash
# Install all dependencies
pnpm install

# Deploy contracts to Mezo Testnet
cd contracts && npx hardhat run scripts/deploy.ts --network mezoTestnet

# Start backend server
cd backend && pnpm dev

# Start frontend
cd frontend && pnpm dev
```

## Development Priority

### MUST BUILD (Core MVP)
1. ServiceRegistry.sol + MEZO staking
2. Express backend + x402 + 1 paid AI endpoint + 1 free trial
3. Frontend: Explore page + Service Detail page
4. Deploy on Mezo Testnet

### SHOULD BUILD (Key Differentiator)
5. AgentVault.sol
6. Frontend: Vault Dashboard page
7. 2nd AI endpoint

### COULD BUILD (Wow Factor)
8. ReviewSystem.sol
9. Battle mode
10. Provider dashboard with analytics
11. Autopilot agent demo

## License

MIT
