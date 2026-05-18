# contracts/test/ — Smart Contract Tests

> **For AI agents:** Hardhat + Chai tests for all Solidity contracts.

## Files

### ServiceRegistry.test.ts
Tests for ServiceRegistry contract:
- `register()` — stakes MEZO, creates service, emits event
- Rejects stake below minimum
- `delist()` — returns MEZO, sets inactive
- Rejects delist by non-owner
- `getAllActive()` — filters delisted services

## How to Run
```bash
cd contracts
npx hardhat test
npx hardhat test test/ServiceRegistry.test.ts  # Single file
```

## Adding Tests
- Use `ethers.getSigners()` for test accounts
- Deploy fresh contracts in `beforeEach`
- Use `MockMEZO.mint()` to fund test accounts
- Test both happy path and revert cases
- Pattern: deploy → setup → act → assert

## Missing Tests (TODO)
- `AgentVault.test.ts` — deposit, withdraw, daily limit, operator approval, requestFunds
- `ReviewSystem.test.ts` — markAsBuyer, rate, getAverageScore, duplicate review rejection
