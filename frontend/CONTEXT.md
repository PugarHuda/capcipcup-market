# frontend/ — Next.js Marketplace UI Context

> **For AI agents:** Read this before editing any file in this folder.

## What This Folder Does

Next.js 15 App Router frontend for the CapCipCup marketplace. Users can:
1. Browse AI services with search, category filter, and sort
2. Try services for free (3 per wallet per service)
3. Pay per-request with MUSD (real ERC20 transfer on Mezo Testnet)
4. Compare services in Battle Mode
5. Manage AgentVault deposits and spending limits
6. View marketplace analytics with real-time data
7. Leave on-chain reviews for services (verified buyers only)
8. Register as a provider by staking MEZO

## Tech Stack

- **Framework:** Next.js 15, App Router, TypeScript
- **Styling:** Tailwind CSS (dark theme, Bitcoin orange #F7931A accent)
- **Wallet:** wagmi v2 + viem v2 for Mezo Testnet wallet connection
- **State:** Client-side React state + backend API calls
- **Backend:** `https://capcipcup-api.vercel.app` (production)

## Pages

### `/` — Home / Marketplace
- Hero section with value proposition
- Service grid with search input, category filter (All/Text/Code/Analysis), sort (popular/fastest/cheapest)
- Each service card: name, model, category badge, price, "Try Service" button

### `/service/[id]` — Service Detail + Playground
- Service metadata (name, model, price, category)
- **Playground**: textarea input → "Try Free" button OR "Pay X MUSD" button
- Free tier: sends to `/api/service/:id/try` (GET)
- Paid: triggers MUSD ERC20 transfer via wallet → then calls `/api/service/:id/paid` (POST with txHash)
- On-chain review section (read reviews from ReviewSystem, submit new review)

### `/battle` — Battle Mode
- Select two services from dropdowns
- Enter same input for both
- Both called in parallel, results displayed side-by-side
- Shows response time comparison and "Faster" badge

### `/vault` — Agent Vault Dashboard
- Shows vault balance, daily limit, wallet MUSD balance
- Deposit form (approve + deposit in two steps)
- Withdraw form
- Set daily limit form
- Operator management (approve/revoke agent wallets)

### `/provider` — Provider Dashboard
- Lists user's registered services with delist option
- Registration form: name, endpoint, price, MEZO stake amount
- Two-step: approve MEZO → register on ServiceRegistry

### `/analytics` — Marketplace Analytics
- Grid of stat cards: on-chain services, API services, total requests, success rate, paid requests, MUSD volume, avg response time, network
- "How It Works" explainer section
- Data from both backend `/api/stats` and on-chain `ServiceRegistry.serviceCount()`

### Error Handling
- `/error.tsx` — Global error boundary with retry button
- `/not-found.tsx` — Custom 404 page with back-to-marketplace link

## Component Structure

```
frontend/
├── app/
│   ├── layout.tsx             — Root layout (Providers, Header, Footer, SEO metadata)
│   ├── page.tsx               — Home/Marketplace (hero + ServiceGrid)
│   ├── error.tsx              — Global error boundary
│   ├── not-found.tsx          — Custom 404 page
│   ├── service/[id]/page.tsx  — Service detail + Playground + Reviews
│   ├── battle/page.tsx        — Battle Mode
│   ├── vault/page.tsx         — Agent Vault dashboard
│   ├── provider/page.tsx      — Provider dashboard + registration
│   └── analytics/page.tsx     — Marketplace analytics
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx         — Nav bar + wallet connect (desktop + mobile)
│   │   └── Footer.tsx         — Footer with links + hackathon info
│   ├── services/
│   │   ├── ServiceCard.tsx    — Card for explore grid
│   │   ├── ServiceGrid.tsx    — Grid with search/filter/sort
│   │   ├── Playground.tsx     — Try-it free/paid panel
│   │   └── ReviewSection.tsx  — On-chain reviews display + form
│   └── ui/
│       └── Toast.tsx          — Toast notifications with tx explorer links
│
├── lib/
│   ├── wagmi.ts               — Wagmi config (Mezo Testnet, MetaMask, WalletConnect)
│   ├── contracts.ts           — Contract addresses + ABIs (ServiceRegistry, AgentVault, ReviewSystem, ERC20)
│   └── api.ts                 — Backend API client (fetchServices, tryServiceFree, fetchMetrics)
│
└── .env.local                 — Environment variables
```

## Key Contracts Integration

| Contract | Frontend Usage |
|----------|---------------|
| ServiceRegistry | Provider page: register/delist, Analytics: serviceCount |
| AgentVault | Vault page: deposit/withdraw/setLimit/operators |
| ReviewSystem | Service detail: getReviews/getAverageScore/rate |
| MUSD (ERC20) | Playground: transfer for payment, Vault: approve+deposit, Balance display |
| MockMEZO | Provider: approve+stake for registration |

All contract reads use wagmi `useReadContract`. All writes use `useWriteContract` + `useWaitForTransactionReceipt`.

## Payment Flow (Frontend)

```
1. User enters text in Playground
2. Clicks "Pay X MUSD"
3. Frontend calls writeContract(MUSD.transfer(PAYMENT_RECEIVER, amount))
4. Wallet prompts user to confirm
5. useWaitForTransactionReceipt watches for confirmation
6. On success: calls POST /api/service/:id/paid with { input, txHash, payer: address }
7. Backend verifies on-chain → returns AI result
8. Frontend displays result
```

## Environment Variables

```env
NEXT_PUBLIC_BACKEND_URL=https://capcipcup-api.vercel.app
NEXT_PUBLIC_MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS=0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c
NEXT_PUBLIC_AGENT_VAULT_ADDRESS=0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=0xa5F1d1781bB50B41434E2f507667e22De3Df27a9
NEXT_PUBLIC_MOCK_MEZO_ADDRESS=0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed
NEXT_PUBLIC_PAYMENT_RECEIVER=0xdbE1a6F994e3E4b6F6A7e36523e9a458C8Ed40Bb
NEXT_PUBLIC_WC_PROJECT_ID=              # Optional: WalletConnect project ID
```

## How to Run

```bash
cd frontend
pnpm install
cp .env.example .env.local  # Fill in values
pnpm dev                     # Starts on port 3001
```

## Deployment

- Platform: Vercel
- Project: `capcipcup-market`
- URL: `https://capcipcup-market.vercel.app`
- Auto-deploy from GitHub (master branch)

## Design System

- **Theme:** Dark (zinc-950 background)
- **Accent:** Bitcoin orange `#F7931A`
- **Font:** Inter (via next/font)
- **Cards:** rounded-xl, border-zinc-800, bg-zinc-900/50
- **Buttons primary:** bg-[#F7931A] text-black
- **Buttons secondary:** bg-zinc-800 text-zinc-300
- **Status:** emerald for success, red for errors, yellow for warnings
- **Layout:** max-w-6xl container, responsive grid (1/2/3/4 cols)

## Gotchas

1. **All wallet components are "use client"** — wagmi hooks require client-side rendering
2. **Contract reads are free** — use `useReadContract` freely. Writes need connected wallet.
3. **MUSD has 18 decimals** — use `formatEther` for display, `parseEther` for inputs
4. **useEffect for tx success** — side effects on transaction confirmation must be in useEffect to avoid infinite re-renders
5. **Backend CORS** — Backend allows `*.vercel.app` origins and localhost
6. **WalletConnect is optional** — Falls back to injected wallets (MetaMask, Rabby) if no project ID configured
