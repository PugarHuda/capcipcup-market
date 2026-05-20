# contracts/contracts/ — Solidity Source Files

## Files

| File | Purpose | Deployed Address |
|------|---------|-----------------|
| `MockMEZO.sol` | ERC20 with open `mint()` — testnet MUSD/MEZO token | `0x118917a...` and `0x4C1B34C...` |
| `ServiceRegistry.sol` | Provider registration with MEZO staking | `0x7Ca15Fed...` |
| `AgentVault.sol` | MUSD vault with daily limits for AI agents | `0x3737f2DB...` |
| `ReviewSystem.sol` | On-chain reviews gated by markAsBuyer | `0xa5F1d178...` |

## Compiler

- Solidity 0.8.24
- Optimizer: enabled (200 runs)
- EVM target: default (Shanghai)

## Dependencies

- OpenZeppelin Contracts v5: ERC20, ReentrancyGuard, Ownable, IERC20
