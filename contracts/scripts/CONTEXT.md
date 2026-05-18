# contracts/scripts/ — Deployment & Utility Scripts

> **For AI agents:** Hardhat scripts for deploying contracts to Mezo Testnet.

## Files

### deploy.ts
Deploys all contracts in order:
1. `MockMEZO` — testnet ERC-20 mock, mints 10,000 to deployer
2. `ServiceRegistry(mezoAddress, minStake=100e18)` — uses MockMEZO address
3. `AgentVault(musdAddress)` — uses real MUSD `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`
4. `ReviewSystem(proxyAddress)` — uses deployer address (or backend wallet)

Prints all deployed addresses at the end. Copy these to `.env`.

## How to Run
```bash
npx hardhat run scripts/deploy.ts --network mezoTestnet
```

## Adding New Scripts
- Follow same pattern: `async function main()` + `main().catch(...)`
- Import from `hardhat` not `ethers` directly
- Always log deployed addresses clearly
- Gas is BTC on Mezo — deployer wallet needs testnet BTC from faucet
