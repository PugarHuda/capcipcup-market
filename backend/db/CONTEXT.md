# backend/db/ — Database Layer

> **For AI agents:** In-memory database for hackathon MVP. Replace with SQLite/Postgres for production.

## Files

### database.ts
Exports singleton `db` — an `InMemoryDB` instance with all data operations.

**Free tier tracking:**
- `getFreeTierUsage(wallet, serviceId)` → number of requests used
- `incrementFreeTier(wallet, serviceId)` → +1 usage
- `getServiceConfig(serviceId)` → free tier limit for service
- Key format: `"wallet:serviceId"` in a Map

**Payment tracking:**
- `recordPayment({ wallet, serviceId, amount, timestamp })` → logs payment
- `getPaymentsByWallet(wallet)` → all payments by a wallet
- `hasWalletPaid(wallet, serviceId)` → boolean for review verification

**Quality metrics:**
- `recordMetric(serviceId, responseTimeMs, success)` → tracks per request
- `getMetrics(serviceId)` → returns totalRequests, successRate, avgResponseTimeMs

## Data Persistence
**None.** All data lives in memory and resets on server restart. This is intentional for the hackathon — keeps things simple, no database setup needed.

For production, migrate to SQLite (`better-sqlite3`) or Postgres. The interface stays the same — just swap the Map operations for SQL queries.

## Default Service Configs
Services 1, 2, 3 are initialized with `freeTierLimit: 3` in the constructor. Update here if you add more services or change limits.
