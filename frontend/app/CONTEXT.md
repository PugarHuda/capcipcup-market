# frontend/app/ — Next.js App Router Pages

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Home — Hero section + ServiceGrid component |
| `/service/[id]` | `service/[id]/page.tsx` | Service detail — metadata + Playground + ReviewSection |
| `/battle` | `battle/page.tsx` | Battle Mode — compare two services side-by-side |
| `/vault` | `vault/page.tsx` | Agent Vault — deposit/withdraw/limits/operators |
| `/provider` | `provider/page.tsx` | Provider — list services + register new |
| `/analytics` | `analytics/page.tsx` | Analytics — marketplace stats from backend + on-chain |

## Special Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout — Providers (wagmi), Header, Footer, global metadata |
| `error.tsx` | Global error boundary — catches component crashes, shows retry button |
| `not-found.tsx` | Custom 404 — "Page Not Found" with link back to marketplace |

## Per-Page SEO

Each major route has a `layout.tsx` with exported `metadata` for page-specific titles:
- `/battle/layout.tsx` — "Battle Mode | CapCipCup Market"
- `/vault/layout.tsx` — "Agent Vault | CapCipCup Market"
- `/provider/layout.tsx` — "Provider Dashboard | CapCipCup Market"
- `/analytics/layout.tsx` — "Analytics | CapCipCup Market"

## Data Flow

- **Home page**: Fetches services from backend on client mount
- **Service detail**: Fetches service info from backend + reads contract data (reviews)
- **Battle**: Calls backend /try endpoint for both services in parallel
- **Vault**: All data from on-chain reads (AgentVault contract)
- **Provider**: All data from on-chain reads (ServiceRegistry contract)
- **Analytics**: Hybrid — backend /api/stats + on-chain serviceCount
