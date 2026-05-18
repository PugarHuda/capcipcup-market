# frontend/components/services/ — Service Marketplace Components

> **For AI agents:** Components for browsing, displaying, and using AI services.

## Files

### ServiceCard.tsx
Card component for the explore grid. Displays:
- Service name (hover → orange)
- Model name
- Price in MUSD
- Quality metrics (avg response time, success rate)
- Free tier availability
- Two buttons: "Try Free" and "Use Service" — both link to `/service/:id`

Props: `{ id, name, model, priceMusd, freeTierLimit, metrics }`

### ServiceGrid.tsx
Grid layout that fetches and renders ServiceCards.
- Calls `fetchServices()` from `lib/api.ts` on mount
- Shows loading skeletons while fetching
- Shows empty state if no services
- Responsive: 1 col mobile, 2 col tablet, 3 col desktop

### Playground.tsx
Interactive try-it panel on service detail page.
- Textarea for user input
- "Try Free" button → calls `tryServiceFree()` from `lib/api.ts`
- "Pay $0.005 MUSD" button → opens backend paid endpoint in new tab (x402 paywall renders there)
- Shows result card with output, model, response time, payment method
- Shows error state with red border
- Uses connected wallet address from wagmi for free tier tracking

## TODO Components
- **BattleMode.tsx** — Side-by-side comparison of 2 services on same input (stretch goal)
- **ReviewList.tsx** — Display reviews from ReviewSystem contract
- **MetricsPanel.tsx** — Chart/stats for service quality metrics
