# contracts/ — Smart Contracts Context

> **For AI agents:** Read this before editing any file in this folder.

## What This Folder Does

Contains Solidity smart contracts deployed to Mezo Testnet (chain 31611). These contracts handle:
1. Service registration with MEZO token staking
2. Agent wallet management with daily spending limits
3. Verified buyer review system

## Key Contracts

### ServiceRegistry.sol (PRIORITY: MUST BUILD)
**Purpose:** On-chain registry where AI service providers register by staking MEZO tokens.

**State:**
- `services` mapping: serviceId → Service struct
- `serviceCount`: auto-incrementing ID
- `minStake`: minimum MEZO required to register (e.g., 100 MEZO)

**Service struct:**
```
{
    id: uint256,
    owner: address,
    name: string,
    endpoint: string,           // URL of the AI service
    pricePerRequest: uint256,   // in MUSD wei (18 decimals)
    metadataURI: string,        // IPFS hash or URL for long description
    mezoStaked: uint256,        // amount of MEZO staked
    freeTierLimit: uint256,     // free requests per wallet (0 = no free tier)
    isActive: bool,
    registeredAt: uint256
}
```

**Functions:**
- `register(name, endpoint, pricePerRequest, metadataURI, freeTierLimit, stakeAmount)` — Provider calls this. Transfers MEZO from provider to contract. Creates service.
- `update(serviceId, endpoint, pricePerRequest, metadataURI, freeTierLimit)` — Only service owner. Updates mutable fields.
- `delist(serviceId)` — Only service owner. Sets isActive=false, returns staked MEZO.
- `getService(serviceId) → Service` — View function.
- `getAllActive() → Service[]` — View. Returns all active services.
- `getServicesByOwner(owner) → Service[]` — View. Returns services by provider.

**Events:**
- `ServiceRegistered(serviceId, owner, name, pricePerRequest, mezoStaked)`
- `ServiceUpdated(serviceId)`
- `ServiceDelisted(serviceId, mezoReturned)`

**Dependencies:**
- OpenZeppelin `IERC20` for MEZO token interaction
- OpenZeppelin `ReentrancyGuard` for safe token transfers

### AgentVault.sol (PRIORITY: SHOULD BUILD)
**Purpose:** MUSD vault where users deposit funds and approve AI agent wallets to spend within daily limits.

**Why it exists:** x402 requires the signer to hold MUSD in their own address. A smart contract can't sign EIP-712. So AgentVault holds MUSD and drips it to agent hot wallets up to a daily limit.

**State:**
- `vaults` mapping: owner address → VaultData
- VaultData contains: balance, dailyLimit, operators mapping, dailySpent mapping, lastResetTime mapping

**Functions:**
- `deposit(amount)` — User deposits MUSD into their vault.
- `withdraw(amount)` — User withdraws MUSD. Only vault owner.
- `setDailyLimit(limit)` — Set max MUSD per 24h across all operators. Only owner.
- `approveOperator(agent)` — Authorize an agent wallet address. Only owner.
- `revokeOperator(agent)` — Remove agent authorization. Only owner.
- `requestFunds(amount)` — Called by approved operator. Checks 24h rolling limit. Transfers MUSD to operator's address.
- `getVaultInfo(owner) → (balance, dailyLimit, ...)` — View function.

**Daily limit logic:**
```
if (block.timestamp > lastResetTime[operator] + 24 hours) {
    dailySpent[operator] = 0;
    lastResetTime[operator] = block.timestamp;
}
require(dailySpent[operator] + amount <= dailyLimit);
```

**Events:**
- `Deposited(owner, amount)`
- `Withdrawn(owner, amount)`
- `FundsRequested(owner, operator, amount)`
- `OperatorApproved(owner, operator)`
- `OperatorRevoked(owner, operator)`

**Dependencies:**
- OpenZeppelin `IERC20` for MUSD token
- OpenZeppelin `ReentrancyGuard`

### ReviewSystem.sol (PRIORITY: COULD BUILD)
**Purpose:** On-chain reviews where only verified buyers can rate services.

**How verification works:** The backend (proxy server) tracks which wallets paid for which services. It calls `markAsBuyer(wallet, serviceId)` to whitelist reviewers. Only the proxy address (set at deploy) can call this.

**State:**
- `reviews` mapping: serviceId → Review[]
- `hasReviewed` mapping: reviewer → serviceId → bool
- `hasPaid` mapping: buyer → serviceId → bool
- `proxyAddress`: address of the CapCipCup backend (set at deploy, only this can call markAsBuyer)

**Functions:**
- `markAsBuyer(buyer, serviceId)` — Only callable by proxy. Marks wallet as verified buyer.
- `rate(serviceId, score, comment)` — Caller must be verified buyer. Score 1-5. One review per pair.
- `getReviews(serviceId) → Review[]` — View.
- `getAverageScore(serviceId) → uint256` — View. Returns average * 100 (e.g., 420 = 4.20).

### MockMEZO.sol (for testnet only)
**Purpose:** Simple ERC-20 token mimicking MEZO for testnet testing. On mainnet, ServiceRegistry would point to the real MEZO token.

**Functions:** Standard ERC-20 + `mint(to, amount)` callable by anyone (for testnet convenience).

## Deployment

### Network Config
```
Network: Mezo Testnet
RPC: https://rpc.test.mezo.org
Chain ID: 31611
Gas token: BTC
Solidity: 0.8.28
```

### Deploy Order
1. Deploy MockMEZO (testnet only)
2. Deploy ServiceRegistry(musdAddress, mezoAddress, minStake)
3. Deploy AgentVault(musdAddress)
4. Deploy ReviewSystem(proxyAddress)

### Required ENV Variables
```
PRIVATE_KEY=           # Deployer wallet private key (has testnet BTC for gas)
MUSD_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
MEZO_ADDRESS=          # MockMEZO address after deploy, or 0x7B7c...0001
PROXY_ADDRESS=         # Backend wallet address (for ReviewSystem)
```

## How to Run

```bash
cd contracts
pnpm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network mezoTestnet
```

## Gotchas

1. **Gas is BTC, not ETH.** Hardhat config must NOT have `gasPrice` in gwei. Use default.
2. **MUSD has 18 decimals.** `1 MUSD = 1e18 wei`. Price $0.005 = `5000000000000000` wei.
3. **MEZO staking is ERC-20 transfer.** Provider must `approve()` ServiceRegistry before calling `register()`.
4. **ReentrancyGuard on all external functions** that transfer tokens. Always.
5. **No upgradeable contracts.** Keep it simple for hackathon. Deploy fresh if changes needed.
