# frontend/components/layout/ — App Layout Components

> **For AI agents:** Navigation, footer, and app-shell components.

## Files

### Header.tsx
Sticky top navigation bar with:
- Logo: "CapCipCup" with orange/white alternating colors
- Nav links: Explore (`/`), Agent Vault (`/vault`)
- Wallet connect button (MetaMask/injected) via wagmi
- Connected state shows truncated address, click to disconnect
- Dark theme: zinc-950 bg with backdrop blur

## TODO
- **Footer.tsx** — "Built on Mezo" badge, links to explorer/docs, hackathon credit
- Add mobile hamburger menu for nav links
- Show MUSD balance next to wallet address when connected
