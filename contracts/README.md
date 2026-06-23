# Contracts

`RwaAssetToken.sol` is a reference contract for allowlisted token transfers. It is intentionally not wired into the default build because the first repo milestone is a simulated product prototype.

Before using any contract in production:

- Replace the reference implementation with audited OpenZeppelin-based contracts.
- Add Hardhat or Foundry tests.
- Add deployment scripts with chain-specific configuration.
- Run external security review.
- Confirm that the legal transfer restrictions match the contract restrictions.

