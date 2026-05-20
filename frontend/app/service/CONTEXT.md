# frontend/app/service/ — Service Detail Pages

## Route

`/service/[id]` — Dynamic route for individual service pages.

## What It Shows

1. Service metadata (name, model, price, category) fetched from backend
2. Playground component for trying the service (free + paid)
3. ReviewSection component for on-chain reviews

## Data Flow

- Fetches service info from `GET /api/services` (filters by ID)
- Playground handles free tier (GET /try) and paid (POST /paid with txHash)
- Reviews read from ReviewSystem contract on-chain

## Key Components Used

- `Playground` from `@/components/services/Playground`
- `ReviewSection` from `@/components/services/ReviewSection`
