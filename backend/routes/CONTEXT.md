# backend/routes/ — Route Handlers (DEPRECATED)

## Status: MERGED INTO api/index.ts

All routes are now defined inline in `api/index.ts` for Vercel Serverless compatibility:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | API info (name, version, features, endpoints) |
| GET | `/health` | Health check (persistence type, verification status) |
| GET | `/api/services` | List services with real-time metrics from Redis |
| GET | `/api/service/:id/try` | Free tier inference (3 per wallet, tracked in Redis) |
| POST | `/api/service/:id/paid` | Paid inference with on-chain tx verification |
| GET | `/api/metrics/:id` | Per-service metrics |
| GET | `/api/stats` | Marketplace-wide analytics |

This folder can be ignored.
