# frontend/app/vault/ — Agent Vault Page

## Purpose

Dashboard for managing AI agent spending. Users deposit MUSD into the AgentVault smart contract, set daily limits, and approve agent wallet addresses as operators.

## Components (all in page.tsx)

- `VaultPage` — Main page, checks wallet connection
- `VaultDashboard` — Shows stats + forms when connected
- `StatCard` — Display card for balance/limit/wallet
- `DepositForm` — Two-step: approve MUSD → deposit into vault
- `WithdrawForm` — Withdraw MUSD from vault
- `SetLimitForm` — Update daily spending limit
- `OperatorForm` — Approve/revoke agent wallet addresses

## Contract Interaction

Uses AgentVault at `CONTRACT_ADDRESSES.agentVault`:
- `getVaultInfo(address)` → [balance, dailyLimit]
- `deposit(amount)` — requires prior MUSD approval
- `withdraw(amount)`
- `setDailyLimit(amount)`
- `approveOperator(address)`
- `revokeOperator(address)`

Also reads MUSD balance via ERC20 `balanceOf`.

## Flow

1. User connects wallet
2. Page reads vault info + MUSD balance
3. User can deposit (approve → deposit), withdraw, set limit, or manage operators
4. Each action uses useWriteContract → useWaitForTransactionReceipt → refetch
5. Toast notification on success with explorer link
