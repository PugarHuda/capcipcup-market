# frontend/ — Next.js Marketplace UI Context

> **For AI agents:** Read this before editing any file in this folder.

## What This Folder Does

Next.js 15 App Router frontend for the CapCipCup marketplace. Users can:
1. Browse available AI services
2. Try services for free (limited per wallet)
3. Pay per-request with MUSD via x402
4. Manage AgentVault deposits and spending limits
5. View service quality metrics and reviews

## Tech Stack

- **Framework:** Next.js 15, App Router, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Wallet:** wagmi v2 + viem for Mezo Testnet wallet connection
- **Data fetching:** Server components for static data, client components for wallet interaction
- **Backend API:** `http://localhost:3000` (Express x402 server)

## Pages

### `/` — Home / Explore Marketplace (MUST BUILD)
Main page. Shows all available AI services in a grid.
Each card displays: name, price, model, rating, success rate, free tier remaining.
"Try Free" and "Use Service" buttons per card.

### `/service/[id]` — Service Detail (MUST BUILD)
Full service page with:
- Service info (name, description, provider, price, MEZO staked)
- "Try it" playground: text input → submit → see result
- Free tier counter ("2 of 3 free requests remaining")
- Quality metrics (response time, success rate, total requests)
- Reviews section (from ReviewSystem contract)

### `/vault` — Agent Vault Dashboard (SHOULD BUILD)
For users managing AI agent spending:
- Deposit MUSD into vault (write to AgentVault contract)
- Set daily spending limit
- Approve/revoke agent wallet addresses
- View spending history per agent
- Current vault balance and remaining daily budget

### `/provider` — Provider Dashboard (COULD BUILD)
For AI service providers:
- Registration guide (stake MEZO, register service)
- Revenue analytics (total earned, requests served)
- Service management (update endpoint, price, delist)

## Component Structure

```
frontend/
├── app/
│   ├── layout.tsx          — Root layout with WagmiProvider + wallet connect
│   ├── page.tsx            — Home/Explore marketplace
│   ├── service/
│   │   └── [id]/
│   │       └── page.tsx    — Service detail + playground
│   ├── vault/
│   │   └── page.tsx        — Agent vault dashboard
│   └── provider/
│       └── page.tsx        — Provider dashboard
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx      — Nav bar with wallet connect button
│   │   └── Footer.tsx      — Footer
│   ├── services/
│   │   ├── ServiceCard.tsx — Card for explore grid
│   │   ├── ServiceGrid.tsx — Grid of cards
│   │   └── Playground.tsx  — Try-it input/output panel
│   ├── vault/
│   │   ├── DepositForm.tsx — Deposit MUSD form
│   │   └── AgentList.tsx   — Approved agents with spending
│   └── ui/                 — shadcn/ui components (button, card, input, etc.)
│
├── lib/
│   ├── wagmi.ts            — Wagmi config for Mezo Testnet
│   ├── contracts.ts        — Contract addresses + ABIs
│   ├── api.ts              — Backend API client functions
│   └── utils.ts            — Formatting helpers (MUSD amounts, etc.)
│
└── public/
    └── ...                 — Static assets
```

## Wallet Configuration (wagmi)

```typescript
// Mezo Testnet chain definition
const mezoTestnet = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.test.mezo.org"] } },
  blockExplorers: { default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" } },
};
```

Supported wallets: MetaMask, Rabby, WalletConnect (via wagmi connectors).

## How Services Are Displayed

1. Frontend calls `GET /api/services` on backend → gets list with metrics
2. For contract data (MEZO staked, reviews), frontend reads directly from contracts via wagmi `useReadContract`
3. Hybrid: backend provides dynamic data (metrics, pricing), contracts provide trustless data (staking, reviews)

## How "Try Free" Works

1. User clicks "Try Free" on service card
2. Frontend sends `GET /api/service/:id/try?input=user_text` with `x-wallet-address` header
3. Backend checks free tier limit → serves if available
4. Result displayed in playground panel
5. Counter updates: "2 of 3 free requests remaining"

## How Paid Requests Work

1. User clicks "Use Service ($0.005 MUSD)"
2. Frontend opens `http://localhost:3000/api/service/:id?input=user_text` in an iframe or new tab
3. x402 paywall UI renders (server-side, from `@x402/paywall`)
4. User connects wallet → signs MUSD payment → result appears
5. OR: Frontend uses programmatic x402 (advanced, stretch goal):
   - Call backend via fetch → receive 402 → handle payment in JS → retry

For hackathon: option 1 (open in new tab) is simpler and reliable.

## Design Guidelines

- **Color scheme:** Dark theme, Bitcoin orange (#F7931A) as accent
- **Typography:** Inter or system font
- **Cards:** Rounded corners, subtle borders, hover effects
- **Layout:** Max-width container (1200px), responsive grid
- **Spacing:** Generous padding, clean whitespace
- **Status indicators:** Green for active, red for errors, orange for warnings

## Environment Variables

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=31611
NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_AGENT_VAULT_ADDRESS=0x...
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
```

## How to Run

```bash
cd frontend
pnpm install
cp .env.example .env.local  # Fill in values
pnpm dev                     # Starts on port 3001
```

## Gotchas

1. **x402 paywall renders server-side.** Don't try to embed it in a React component. Open paid endpoints in a new tab or iframe.
2. **wagmi needs client-side rendering.** Wrap wallet components in `"use client"` directive.
3. **Contract reads are free.** Use `useReadContract` freely for display data. Writes need connected wallet.
4. **MUSD has 18 decimals.** Use `formatEther` for display, `parseEther` for inputs.
5. **Backend CORS.** Backend must allow requests from `http://localhost:3001`.
