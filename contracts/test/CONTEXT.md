# contracts/test/ — Contract Tests

## Purpose

Hardhat tests for smart contract functionality.

## Running Tests

```bash
cd contracts
npx hardhat test
```

## Test Coverage

- MockMEZO: mint, transfer, balanceOf
- ServiceRegistry: register, delist, getServicesByOwner
- AgentVault: deposit, withdraw, setDailyLimit, approveOperator, requestFunds
- ReviewSystem: markAsBuyer, rate, getReviews, getAverageScore
