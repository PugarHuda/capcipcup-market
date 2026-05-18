# contracts/contracts/ — Solidity Source Files

> **For AI agents:** This folder contains ALL Solidity smart contracts for CapCipCup.

## Files

### ServiceRegistry.sol (MUST BUILD — Priority 1)
On-chain registry for AI service providers. Providers stake MEZO tokens to register.
- `register()` — Stake MEZO, create service listing
- `update()` — Edit mutable fields (endpoint, price, metadata)
- `delist()` — Deactivate service, return staked MEZO
- `getAllActive()` — View all active services
- Uses OpenZeppelin `IERC20` + `ReentrancyGuard`

### AgentVault.sol (SHOULD BUILD — Priority 2)
MUSD vault for autonomous AI agent spending. Users deposit MUSD, set daily limits, approve agent wallets.
- `deposit()` / `withdraw()` — MUSD management
- `approveOperator()` / `revokeOperator()` — Agent wallet authorization
- `requestFunds()` — Agent calls this to get MUSD dripped to its wallet (checks 24h rolling limit)
- x402 requires signer to HOLD MUSD — vault transfers to agent EOA, agent signs payments

### ReviewSystem.sol (COULD BUILD — Priority 3)
Verified buyer reviews. Only wallets marked as buyers by the backend proxy can rate services.
- `markAsBuyer()` — Only callable by proxy address (set at deploy)
- `rate()` — Score 1-5, one review per (buyer, service) pair
- `getAverageScore()` — Returns score * 100 (e.g., 420 = 4.20)

### MockMEZO.sol (Testnet utility)
Simple ERC-20 with public `mint()`. Used for testnet staking tests. On mainnet, ServiceRegistry would point to real MEZO at `0x7B7c000000000000000000000000000000000001`.

## Conventions
- Solidity 0.8.28
- OpenZeppelin v5 imports (`@openzeppelin/contracts/...`)
- `ReentrancyGuard` on all functions that transfer tokens
- Events for every state change
- Descriptive `require()` messages
- MUSD = 18 decimals, MEZO = 18 decimals
