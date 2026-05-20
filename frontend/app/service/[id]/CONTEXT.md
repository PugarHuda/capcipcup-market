# frontend/app/service/[id]/ — Service Detail Page

## File: page.tsx

Client component that:
1. Extracts `id` from URL params
2. Fetches all services from backend API
3. Finds the matching service by ID
4. Renders service metadata (name, model, category, price)
5. Renders `Playground` component with serviceId and priceMusd
6. Renders `ReviewSection` component with serviceId

## Props Passed

- `Playground`: `serviceId={id}`, `priceMusd={price without $ sign}`
- `ReviewSection`: `serviceId={id}`
