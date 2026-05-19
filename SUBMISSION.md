# Hackathon Submission — CapCipCup Market

## Project Name
CapCipCup Market

## Tagline
AI Inference Marketplace — Pay per request with Bitcoin-backed MUSD on Mezo

## Track
MUSD Track

## Short Description (280 chars)
CapCipCup is a decentralized AI inference marketplace on Mezo where anyone can sell or consume AI services with per-request MUSD micropayments. Zero gas for buyers, free trials for everyone, and AgentVault for autonomous AI agents to spend within daily limits.

## Long Description

### What it does
CapCipCup Market is a fully functional AI inference marketplace deployed on Mezo Testnet. Providers stake MEZO tokens to list AI services (text summarization, code review, sentiment analysis, translation). Consumers can try any service for free (3 requests), then pay per-request with MUSD — Mezo's Bitcoin-backed stablecoin. The x402 protocol enables zero-gas payments for buyers.

For autonomous AI agents, the AgentVault smart contract allows owners to deposit MUSD, set daily spending limits, and approve agent wallets as operators. Agents can then independently call marketplace services, pay with MUSD, and stay within on-chain spending guardrails — no human intervention needed.

### How it's built
- **Smart Contracts**: 4 Solidity contracts (ServiceRegistry, AgentVault, ReviewSystem, MockMEZO) deployed on Mezo Testnet
- **Backend**: Express.js serverless API on Vercel with OpenRouter AI integration (6 models including GPT-OSS 120B, Nemotron 3 Super, DeepSeek V4 Flash)
- **Frontend**: Next.js 15 with wagmi/viem for wallet interaction, Tailwind CSS for UI
- **Agent**: Autonomous Node.js agent that requests funds from AgentVault and pays for AI services on-chain
- **Payments**: Real ERC20 MUSD transfers verified by tx hash, with duplicate-spend prevention

### Key features
1. **6 AI services** across 3 different models with varying price points ($0.003 - $0.01 MUSD)
2. **Battle Mode** — compare two AI services side-by-side with the same input
3. **Free tier** — 3 requests per wallet per service, no wallet needed to start
4. **Real MUSD payments** — ERC20 transfer on Mezo Testnet with on-chain verification
5. **AgentVault** — deposit MUSD, set daily limits, approve agent operators
6. **On-chain reviews** — only verified buyers can rate services (1-5 stars)
7. **Provider dashboard** — register, view, and delist services with MEZO staking
8. **Analytics** — marketplace-wide stats including on-chain service count
9. **Testnet faucet** — mint MUSD/MEZO tokens directly from the UI
10. **WalletConnect** — supports MetaMask, Rabby, and any WalletConnect wallet

### How MUSD is integrated
- **Consumer payments**: Users transfer MUSD to pay for AI inference (0.003-0.01 per request)
- **AgentVault deposits**: Users deposit MUSD for AI agents to spend autonomously
- **Provider earnings**: Providers receive MUSD for every service call
- **Faucet**: Users can mint testnet MUSD from the navbar to try the full flow

### How MEZO is integrated
- **Provider staking**: Must stake MEZO tokens to register services on ServiceRegistry
- **Skin in the game**: Staked MEZO is returned only when provider voluntarily delists
- **Trust signal**: Higher stake = more committed provider

### Why this matters
Mezo's 2026 roadmap states: "AI-Ready Infrastructure — Mezo will explore infrastructure that better supports AI-agent interactions, including payment rails, agent-compatible endpoints, and tooling for autonomous transactions." CapCipCup is exactly this — production-ready infrastructure for AI agents to discover, consume, and pay for services with MUSD.

## Links
- **Live Demo**: https://capcipcup-market.vercel.app
- **Backend API**: https://capcipcup-api.vercel.app
- **GitHub**: https://github.com/PugarHuda/capcipcup-market

## Contracts (Mezo Testnet - Chain 31611)
- ServiceRegistry: `0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c`
- AgentVault: `0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1`
- ReviewSystem: `0xa5F1d1781bB50B41434E2f507667e22De3Df27a9`
- MockMEZO: `0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed`

## Team
Solo developer — PugarHuda

## Demo Instructions
1. Visit https://capcipcup-market.vercel.app
2. Click "Try Free" on any service — no wallet needed
3. Connect wallet (MetaMask/Rabby on Mezo Testnet)
4. Click "+MUSD" in navbar to mint testnet tokens
5. After 3 free tries, use "Pay MUSD" button to make a real on-chain payment
6. Try Battle Mode to compare two services side-by-side
7. Visit Agent Vault to deposit MUSD and set up an agent operator
8. Visit Provider to register your own AI service with MEZO staking
9. Leave a review on any service you've used
