# CONTEXT.md — Global Project Context for AI Agents

> **Purpose:** This file provides full context for any AI agent (Claude, GPT, Cursor, Copilot, etc.) working on this codebase. Read this FIRST before touching any code.

## Project Identity

- **Name:** CapCipCup Market
- **Type:** AI Inference Marketplace with MUSD micropayments
- **Hackathon:** Mezo Hackathon 2026 (April 13 – May 25, 2026)
- **Track:** MUSD Track (consumer experiences powered by Bitcoin-backed MUSD)
- **Deadline:** May 25, 2026
- **Team size:** Small (1-3 people)

## What This Project Does (Plain English)

CapCipCup is a marketplace where:
- **Providers** register AI services (summarization, translation, etc.) by staking MEZO tokens
- **Consumers** (humans or AI agents) browse services, try them for free, then pay per-request with MUSD
- **Payments** happen via x402 protocol — an HTTP-native payment standard where the server returns `402 Payment Required` and the client auto-signs a MUSD payment
- **CapCipCup acts as a PROXY** — it receives MUSD from consumers, calls the AI provider API, and returns the result. It keeps 1% as a platform fee.

## Critical Technical Facts

### x402 Protocol
- x402 is an open payment standard: server returns HTTP 402, client signs MUSD payment, facilitator settles on-chain
- On Mezo, MUSD is the settlement asset (18 decimals, permit2 + EIP-2612)
- **Facilitator** (`https://facilitator.vativ.io/`) pays gas on behalf of both buyer and seller — ZERO gas for everyone
- SDK packages: `@x402/express` (server), `@x402/fetch` (client), `@x402/paywall` (browser UI), `@x402/evm`, `@x402/core`
- **IMPORTANT:** Use `@x402/*` version >= 2.11.0 for Mezo MUSD support. Add pnpm overrides if needed.
- Network identifier for Mezo Testnet: `eip155:31611` (CAIP-2 format, NOT `mezo-testnet`)

### Mezo Chain
- EVM-compatible (Solidity, Hardhat, Foundry all work)
- Native gas token: BTC (not ETH)
- Testnet RPC: `https://rpc.test.mezo.org`
- Chain ID: 31611 (testnet), 31612 (mainnet)
- MUSD token: `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` (testnet)
- MEZO token (native): `0x7B7c000000000000000000000000000000000001`
- Block explorer: `https://explorer.test.mezo.org`
- Solidity version: 0.8.28

### Payment Flow (How CapCipCup Receives Money)
```
1. Consumer hits GET /api/service/:id
2. Express x402 middleware returns 402 + payment requirements
3. Consumer's browser shows x402 paywall OR agent's @x402/fetch auto-signs
4. Signed payment sent back to server
5. Server forwards to facilitator for verification
6. Facilitator settles MUSD transfer on-chain (consumer → CapCipCup wallet)
7. Server calls AI provider API
8. Server returns AI result to consumer
```
CapCipCup wallet receives ALL payments. It's the `payTo` address in x402 config.

### Smart Contracts Overview
1. **ServiceRegistry.sol** — Providers register by staking MEZO. Stores: name, endpoint, price, freeTierLimit, isActive. Permissionless registration.
2. **AgentVault.sol** — Users deposit MUSD, set daily spending limits, approve agent wallets as operators. Agents call `requestFunds()` to get MUSD dripped to their hot wallet (max dailyLimit per 24h rolling window).
3. **ReviewSystem.sol** — Only verified buyers (tracked by backend) can rate services 1-5. One review per (buyer, service) pair.

### Frontend Architecture
- Next.js 15 App Router
- Tailwind CSS + shadcn/ui for styling
- wagmi + viem for wallet connection (MetaMask, Rabby)
- Connected to Mezo Testnet (chain 31611)
- Reads contract data via public RPC, writes via connected wallet

### Backend Architecture
- Express.js + TypeScript
- `@x402/express` middleware gates paid endpoints
- Two types of routes: free tier (no x402) and paid (x402)
- Proxy pattern: receives payment → calls external AI API → returns result
- Tracks payments in local database (SQLite or in-memory for hackathon)

## Design Decisions (Why We Did It This Way)

### Why proxy model (not direct buyer→provider)?
x402 sends payment directly to `payTo` address. If buyer pays provider directly, CapCipCup can't take a fee, verify reviews, or measure quality. By being the proxy, we control the full flow.

### Why two routes for free/paid instead of middleware bypass?
x402 middleware can't conditionally skip payment. Cleaner to have `/api/service/:id/try` (free, no x402) and `/api/service/:id` (paid, x402) as separate routes sharing the same handler logic.

### Why AgentVault drips MUSD to agent wallet instead of signing from vault?
x402 requires the SIGNER to hold MUSD (permit2 signing). Smart contracts can't sign EIP-712 messages. So the vault transfers MUSD to the agent's EOA wallet, which then signs x402 payments normally.

### Why mock MEZO token on testnet?
The real MEZO token may not be easily obtainable on testnet for staking tests. Deploying a mock ERC-20 with the same interface is standard hackathon practice. On mainnet, the contract would point to the real MEZO address.

### Why off-chain quality metrics instead of on-chain?
Updating metrics on-chain every request costs gas (BTC). Off-chain measurement by the proxy is free, real-time, and sufficient. Only reviews go on-chain for trustless verification.

## Constraints & Gotchas

1. **x402 paywall UI is server-rendered** — When a browser hits a 402 endpoint, the paywall HTML is served by Express. It has its own wallet-connect UI. We don't control its styling deeply.
2. **Minimum MUSD borrow is 2000** — On testnet, you need testnet BTC first (from faucet), then borrow at mezo.org/feature/borrow. One borrow covers ~2M test payments.
3. **Votes/locks not relevant** — We do NOT interact with veBTC, veMEZO, gauges, or the Earn system. Our MEZO integration is simple ERC-20 staking.
4. **Facilitator dependency** — All payments depend on `facilitator.vativ.io`. If it's down, payments fail. Always record demo video as backup.
5. **BTC for gas** — Deploying contracts and sending transactions requires testnet BTC. Get from faucet: https://faucet.test.mezo.org/

## File Structure Convention

Each major folder has its own `CONTEXT.md` explaining:
- What this folder does
- Key files and their purpose
- How to run/test
- Dependencies and gotchas
- What an AI agent should know before editing

## Coding Standards

- TypeScript everywhere (backend + frontend + scripts)
- Solidity 0.8.28 for contracts
- Use OpenZeppelin for contract utilities (ReentrancyGuard, Ownable, IERC20)
- pnpm as package manager (NOT npm or yarn)
- ESM modules (`"type": "module"` in package.json)
- No unnecessary comments — code should be self-documenting
- Error messages should be descriptive for debugging
