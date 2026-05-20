# frontend/components/services/ — Service UI Components

## Files

### `ServiceGrid.tsx`
Main marketplace grid on the home page:
- Fetches services from backend API on mount
- Search input filters by name/model
- Category filter pills: All, Text, Code, Analysis
- Sort options: Popular (most requests), Fastest (lowest latency), Cheapest (lowest price)
- Renders ServiceCard for each filtered/sorted service

### `ServiceCard.tsx`
Individual service card in the grid:
- Displays: name, model, category badge, price
- "Try Service →" button links to /service/:id
- Hover state with border highlight

### `Playground.tsx`
Interactive try-it panel on service detail page:
- Textarea for user input
- "Try Free" button → calls tryServiceFree() from lib/api
- "Pay X MUSD" button → triggers ERC20 transfer via wagmi, then calls paid endpoint
- Displays result with model, response time, payment method
- Handles 402 (free tier exhausted) and error states
- Uses useWriteContract + useWaitForTransactionReceipt for payment flow

### `ReviewSection.tsx`
On-chain reviews for a service:
- Reads reviews from ReviewSystem contract (useReadContract)
- Displays average score (stars) and individual reviews
- Submit form (score 1-5 + comment) — writes to ReviewSystem.rate()
- Only shown to connected wallets (must be verified buyer via markAsBuyer)
