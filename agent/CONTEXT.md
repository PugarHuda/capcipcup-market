# agent/ — Autonomous Agent Demo Context

> **For AI agents:** Read this before editing any file in this folder.

## What This Folder Does

Contains a Node.js script that demonstrates a **fully autonomous AI agent** spending MUSD on CapCipCup services without human intervention. This is the "wow" demo for the hackathon — a live agent working on its own.

## How It Works

```
1. Agent has an AgentVault with MUSD deposited and daily limit set
2. Agent's hot wallet is approved as vault operator
3. Agent calls vault.requestFunds() to get MUSD to its wallet
4. Agent calls CapCipCup API endpoints using @x402/fetch
5. @x402/fetch auto-signs MUSD payments from agent's wallet
6. Agent receives AI results and posts them to a dashboard endpoint
7. Repeat on interval (every N seconds for demo, every hour for production)
```

## The Demo Agent: "NewsBot"

**Task:** Periodically fetch news-related text, summarize it, and post the summary.

**For hackathon demo:** Set interval to 30 seconds so judges can see it run multiple times. Show the dashboard updating in real-time.

## Key File: `autopilot.ts`

Single script that:
1. Loads agent wallet from private key (env var)
2. Calls AgentVault.requestFunds() if wallet balance is low
3. Calls CapCipCup summarization service via x402
4. Posts result to backend dashboard endpoint
5. Logs all activity to console
6. Repeats

## Dependencies

- `@x402/fetch` — Programmatic x402 payment client
- `@x402/evm` — EVM scheme for signing
- `viem` — Wallet creation from private key
- `ethers` — Contract interaction (AgentVault)

## Environment Variables

```env
AGENT_PRIVATE_KEY=0x...          # Agent hot wallet private key
VAULT_OWNER_ADDRESS=0x...        # Vault owner (who deposited MUSD)
AGENT_VAULT_ADDRESS=0x...        # AgentVault contract
BACKEND_URL=http://localhost:3000
INTERVAL_MS=30000                # Demo: 30s. Production: 3600000 (1h)
```

## Prerequisites

Before running the agent:
1. AgentVault contract is deployed
2. Vault owner has deposited MUSD into the vault
3. Vault owner has approved the agent's wallet as operator
4. Vault owner has set a daily limit
5. Backend server is running with AI services available

## How to Run

```bash
cd agent
pnpm install
cp .env.example .env  # Fill in values
pnpm start
```

## Gotchas

1. **Agent needs testnet BTC for gas** when calling requestFunds() on AgentVault. Get from faucet.
2. **Agent needs MUSD in its own wallet** to sign x402 payments. That's what requestFunds() provides.
3. **@x402/fetch version >= 2.11.0** required for Mezo MUSD support.
4. **For demo: keep interval short** (30s). For submission video: can show 2-3 cycles running.
5. **This is a STRETCH GOAL.** Build core marketplace first. Only implement this if time permits.
