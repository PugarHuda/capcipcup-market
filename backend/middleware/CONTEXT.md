# backend/middleware/ — Express Middleware

> **For AI agents:** Middleware functions that run before route handlers.

## Files

### freeTier.ts
Checks if a consumer has free requests remaining for a service.
- Reads wallet address from `x-wallet-address` header (falls back to IP)
- Looks up service free tier limit from in-memory DB
- If under limit → increments counter, calls `next()`
- If over limit → returns 402 with redirect to paid endpoint
- Used on `/api/service/:id/try` routes

### trackPayment.ts
Runs AFTER x402 middleware has verified payment (on paid routes only).
- Logs payment record (wallet, serviceId, amount, timestamp) to in-memory DB
- Used for review verification and analytics
- Reads payer address from `x-payer-address` header (set by x402 middleware)

## Important: x402 Middleware
The main x402 payment middleware is configured in `server.ts` using `paymentMiddleware()` from `@x402/express`. It is NOT in this folder — it's inline in server.ts because it wraps route definitions.

## Adding Middleware
- Export as named function: `export function myMiddleware(req, res, next)`
- Use Express types: `Request, Response, NextFunction`
- Always call `next()` on success, `res.status().json()` on failure
- Never throw — always handle errors gracefully
