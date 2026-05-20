# contracts/scripts/ — Deployment Scripts

## Purpose

Hardhat deployment scripts for deploying contracts to Mezo Testnet.

## Usage

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network mezoTestnet
```

## Network Config (hardhat.config.ts)

```typescript
mezoTestnet: {
  url: "https://rpc.test.mezo.org",
  chainId: 31611,
  accounts: [process.env.PRIVATE_KEY]
}
```

## Current Deployed Addresses

All contracts are already deployed. Re-deployment is only needed if contract logic changes.
See root `CONTEXT.md` for all addresses.
