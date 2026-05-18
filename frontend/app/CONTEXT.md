# frontend/app/ — Next.js App Router Pages

> **For AI agents:** All pages and layouts for the CapCipCup marketplace UI.

## Architecture
Next.js 15 App Router. Each folder = a route segment. `page.tsx` = the rendered page.

## Files

### layout.tsx (Root Layout)
- Wraps entire app with `<Providers>` (wagmi + react-query)
- Includes `<Header>` navigation
- Sets dark theme (`className="dark"`, bg-zinc-950)
- Uses Inter font from Google Fonts
- Meta title: "CapCipCup Market — AI Inference Marketplace on Mezo"

### providers.tsx
Client component wrapping `WagmiProvider` + `QueryClientProvider`.
- Must be `"use client"` — wagmi needs browser APIs
- Creates QueryClient in useState to avoid SSR issues

### globals.css
Tailwind directives + CSS custom properties:
- `--bitcoin-orange: #F7931A` (brand accent)
- `--mezo-red: #E5383B` (secondary)

### page.tsx (Home — `/`)
Server component. Renders hero text + `<ServiceGrid>`.
Headline: "AI Services, Paid with Bitcoin"

## Subfolders

### service/[id]/ → `/service/:id`
Dynamic route for individual service detail + playground.
Client component — uses `useParams()` to get service ID.

### vault/ → `/vault`
Agent Vault dashboard. Placeholder for now.
Will contain: deposit MUSD, set daily limit, approve agents.

## Adding a New Page
1. Create folder: `app/my-page/`
2. Add `page.tsx` inside it
3. Default export a React component
4. Add nav link in `components/layout/Header.tsx`
5. Server component by default — add `"use client"` only if needs hooks/browser APIs
