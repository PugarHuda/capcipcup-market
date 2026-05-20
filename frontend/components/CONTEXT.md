# frontend/components/ — UI Components

## Structure

```
components/
├── layout/
│   ├── Header.tsx       — Navigation + wallet connect
│   └── Footer.tsx       — Site footer with links
├── services/
│   ├── ServiceCard.tsx  — Individual service card
│   ├── ServiceGrid.tsx  — Grid with search/filter/sort
│   ├── Playground.tsx   — Free/paid inference panel
│   └── ReviewSection.tsx — On-chain reviews
└── ui/
    └── Toast.tsx        — Toast notification system
```

## Toast System

Custom lightweight toast (no external library):
- `ToastProvider` wraps the app in layout.tsx
- `useToast()` hook returns `toast(message, type, txHash?)`
- Types: success (green), error (red), info (blue)
- Auto-dismisses after 5 seconds
- If txHash provided, shows "View on Explorer" link to Mezo Explorer
