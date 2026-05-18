# backend/routes/ — API Route Handlers

> **For AI agents:** Express route handler functions. Each file exports handler functions used in server.ts.

## Files

### service.ts
Handles individual AI service requests (both paid and free).
- `serviceHandler(req, res)` — **Paid endpoint.** Reached after x402 payment verified. Calls AI provider, returns result, records metrics.
- `serviceTryHandler(req, res)` — **Free endpoint.** Same logic, no payment. Reached after freeTierMiddleware passes.
- Both read `input` or `text` from query params: `?input=your+text+here`
- Both call `callProvider(serviceId, input)` from `services/aiProviders.ts`

### services.ts
Lists all available AI services.
- `servicesListHandler(req, res)` — Returns array of services with name, model, price, free tier limit, and quality metrics.
- Frontend calls this on home page load.

### metrics.ts
Returns quality metrics for a specific service.
- `metricsHandler(req, res)` — Returns totalRequests, successRate, avgResponseTimeMs.
- Data measured by the proxy (not self-reported by providers).

## Route Registration
Routes are registered in `server.ts`:
- Free routes: registered BEFORE `paymentMiddleware()`
- Paid routes: registered AFTER `paymentMiddleware()`
- Order matters! x402 middleware intercepts all routes registered after it.

## Adding New Routes
1. Create handler function in a new or existing file
2. Export it as named export
3. Register in `server.ts` — place BEFORE paymentMiddleware for free, AFTER for paid
4. If paid, add pricing config to the paymentMiddleware configuration object
