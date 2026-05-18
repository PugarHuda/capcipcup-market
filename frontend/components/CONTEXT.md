# frontend/components/ — Reusable React Components

> **For AI agents:** All UI components used across pages.

## Folder Structure
```
components/
├── layout/         — App-level layout (Header, Footer)
├── services/       — Service marketplace components (cards, grid, playground)
└── ui/             — shadcn/ui primitives (button, card, input, etc.) — add as needed
```

## Conventions
- All interactive components must be `"use client"`
- Server components should NOT import client components directly (wrap in Suspense or pass as children)
- Styling: Tailwind CSS classes inline. shadcn/ui for complex primitives.
- Color palette: zinc-950 bg, zinc-100 text, `#F7931A` (Bitcoin orange) accent
- No inline styles — Tailwind only
- Props interfaces defined above component in same file

## Adding Components
1. Create in appropriate subfolder (layout/, services/, vault/, ui/)
2. Export as named export: `export function MyComponent()`
3. Add `"use client"` if component uses hooks, event handlers, or browser APIs
4. Keep components focused — one responsibility per file
