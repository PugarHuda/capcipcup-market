# frontend/app/service/[id]/ — Service Detail Page

> **For AI agents:** Dynamic page for a single AI service.

## page.tsx
- Route: `/service/:id` (e.g., `/service/1`)
- Client component (`"use client"`) — needs `useParams()` hook
- Renders `<Playground serviceId={id} />`

## What Playground Does
See `components/services/Playground.tsx`:
- Text input area for user's prompt
- "Try Free" button → calls `/api/service/:id/try` (free tier)
- "Pay $0.005 MUSD" button → opens paid endpoint in new tab (x402 paywall)
- Shows result with model name, response time, payment method

## TODO Enhancements
- Fetch and display service metadata (name, description, MEZO staked) from contract
- Show free tier counter ("2 of 3 remaining")
- Add reviews section below playground
- Add quality metrics sidebar
