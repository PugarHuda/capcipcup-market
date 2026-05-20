# agent/ — Autonomous Agent Demo

## Purpose

Demonstrates machine-to-machine payments: an AI agent autonomously consumes AI services from the marketplace, paying with MUSD from its AgentVault allocation.

## File: autopilot.ts

A "NewsBot" agent that:
1. Checks its MUSD balance (from vault allocation)
2. Calls the Text Summarizer service with news input
3. Pays MUSD per request (real ERC20 transfer)
4. Logs results and spending

## How It Works

```
1. Agent wallet is approved as operator on AgentVault
2. Agent calls AgentVault.requestFunds() to get MUSD dripped to its wallet
3. Agent transfers MUSD to PAYMENT_RECEIVER
4. Agent calls POST /api/service/:id/paid with txHash
5. Gets AI result back
6. Repeats on interval (demonstrates autonomous operation)
```

## Environment Variables

```env
PRIVATE_KEY=0x...           # Agent hot wallet private key
PAYMENT_RECEIVER=0xdbE1a6F... # CapCipCup payment receiver
BACKEND_URL=https://capcipcup-api.vercel.app
```

## Running

```bash
cd agent
npm install
npx tsx autopilot.ts
```

## Note

This is a demo/proof-of-concept. In production, the agent would run as a service with proper error handling, retry logic, and budget monitoring.
