# frontend/app/vault/ — Agent Vault Dashboard

> **For AI agents:** Page for managing AgentVault smart contract — deposit MUSD, set limits, approve agents.

## page.tsx
- Route: `/vault`
- Client component — needs wallet connection
- Currently a placeholder with basic text

## What It Should Become (TODO)
1. **Vault Status Panel** — Show connected wallet's vault balance and daily limit (read from AgentVault contract via `useReadContract`)
2. **Deposit Form** — Input MUSD amount → approve MUSD spend → call `vault.deposit(amount)`
3. **Set Daily Limit** — Input amount → call `vault.setDailyLimit(amount)`
4. **Operator Management** — List approved agents, add new (address input → `approveOperator()`), revoke existing
5. **Spending History** — Show per-operator spent vs limit, last reset time

## Contract Interactions
All writes need connected wallet. Use wagmi hooks:
- `useReadContract` for view functions (getVaultInfo, getOperatorSpent)
- `useWriteContract` for state changes (deposit, withdraw, setDailyLimit, approveOperator)
- MUSD `approve()` must be called before `deposit()` (standard ERC-20 pattern)

## ABI
See `lib/contracts.ts` → `AGENT_VAULT_ABI` for minimal ABI. Expand as needed from compiled artifacts.
