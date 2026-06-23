# Architecture

RWA Token Studio separates product rules from presentation so the demo can grow into a real full-stack app without rewriting the core model.

## Layers

```text
apps/web
  React screens, local UI state, simulated admin actions

packages/domain
  Asset, investor, ledger, and purchase validation rules

contracts
  Reference allowlisted token contract for future testnet experiments

docs
  Product, compliance, roadmap, and API notes
```

## Current Runtime

The first version is intentionally frontend-led. Data is seeded in `packages/domain`, then managed in local React state. This makes the repo simple to run and review on GitHub.

## Future Backend Boundary

A production-grade version would move these responsibilities to an API:

- Asset issuance lifecycle.
- Investor identity and eligibility checks.
- Subscription orders and payment settlement.
- Transfer approvals and audit logging.
- Document storage and disclosure versioning.
- Portfolio reporting and tax exports.

The React app should call that API through a typed client rather than importing seed data directly.

## Smart Contract Boundary

The contract in `contracts/` is a reference design only. It shows allowlisted transfers and owner-controlled minting, but it is not audited and is not compiled by the default CI gate.

