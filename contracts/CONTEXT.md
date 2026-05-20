# contracts/ — Solidity Smart Contracts

## Overview

Four smart contracts deployed on Mezo Testnet (chain 31611):

| Contract | Address | Purpose |
|----------|---------|---------|
| MockMEZO (MUSD) | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` | ERC20 payment token with open mint |
| ServiceRegistry | `0x7Ca15Feda3a17B215035C984c2CAB8ee68f9416c` | Provider registration + MEZO staking |
| AgentVault | `0x3737f2DB9c9a68d4Ad8bCc6f092AEe5dbc21a5c1` | MUSD vault + daily limits for agents |
| ReviewSystem | `0xa5F1d1781bB50B41434E2f507667e22De3Df27a9` | Verified buyer reviews |
| MockMEZO (Staking) | `0x4C1B34C6650B63B8c43559a2bbB2CdA0eE5711ed` | Token for staking on registry |

## Contracts Detail

### ServiceRegistry.sol
- `register(name, endpoint, price, metadataURI, freeTierLimit, stakeAmount)` — Provider stakes MEZO to list a service
- `delist(serviceId)` — Provider removes service, gets stake back
- `getServicesByOwner(address)` — Returns all services by a provider
- `serviceCount()` — Total registered services

### AgentVault.sol
- `deposit(amount)` — Deposit MUSD (requires prior approval)
- `withdraw(amount)` — Withdraw MUSD
- `setDailyLimit(amount)` — Set max daily spend
- `approveOperator(agent)` — Allow agent wallet to request funds
- `revokeOperator(agent)` — Revoke agent access
- `requestFunds(amount, to)` — Agent requests MUSD (within daily limit)
- `getVaultInfo(owner)` — Returns [balance, dailyLimit]

### ReviewSystem.sol
- `markAsBuyer(buyer, serviceId)` — Called by backend proxy after payment verification
- `rate(serviceId, score, comment)` — Buyer submits review (1-5 stars + comment)
- `getReviews(serviceId)` — Returns all reviews for a service
- `getAverageScore(serviceId)` — Returns average score

### MockMEZO.sol
- Standard ERC20 with `mint(amount)` — anyone can mint (testnet only)
- Used as MUSD payment token and MEZO staking token

## Tech Stack

- Solidity 0.8.24
- Hardhat for compilation and deployment
- OpenZeppelin (ERC20, ReentrancyGuard, Ownable)
- Deployed via Hardhat scripts to Mezo Testnet

## How to Deploy

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network mezoTestnet
```

## Verification Status

All contracts have bytecode confirmed on Mezo Testnet via `eth_getCode` RPC call.
