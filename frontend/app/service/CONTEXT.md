# frontend/app/service/ — Service Routes

> **For AI agents:** Dynamic route segment for individual AI service pages.

## Structure
```
service/
└── [id]/
    └── page.tsx    → renders at /service/1, /service/2, etc.
```

## [id]/page.tsx
Client component that:
1. Reads service ID from URL params via `useParams()`
2. Renders `<Playground serviceId={id} />` component
3. Playground handles both free trial and paid usage

## Future Additions
- Add `loading.tsx` for suspense fallback
- Add service metadata (name, description) above playground
- Add reviews section (reads from ReviewSystem contract)
- Add metrics panel (calls `/api/metrics/:id`)
