# backend/db/ — Database Layer (DEPRECATED)

## Status: NOT USED

The backend previously planned to use SQLite for state tracking. This has been replaced with **Upstash Redis** for persistence across Vercel Serverless cold starts.

All state is now managed directly in `api/index.ts` via Redis functions:
- `getFreeTierUsage()` / `incrFreeTierUsage()`
- `getMetrics()` / `incrMetrics()`
- `isPaymentUsed()` / `markPaymentUsed()`
- `checkRateLimit()`

This folder can be ignored.
