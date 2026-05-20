# backend/middleware/ — Middleware (DEPRECATED)

## Status: MERGED INTO api/index.ts

All middleware logic is now inline in `api/index.ts`:

- **CORS**: Configured via `cors()` — allows `*.vercel.app` + localhost origins
- **Rate limiting**: `checkRateLimit(ip)` — 20 req/min per IP via Redis INCR + 60s EXPIRE
- **Input sanitization**: `sanitizeInput(input)` — trims to 5,000 chars max
- **Body size limit**: `express.json({ limit: "50kb" })`

The x402 middleware (`@x402/express`) is NOT used in the current implementation. 
Payment verification is done directly via on-chain transaction receipt checking with viem.

This folder can be ignored.
