# Architecture

RWA Token Studio separates product rules from presentation so the demo can grow into a real full-stack app without rewriting the core model.

## Layers

```text
apps/api
  Fastify routes, Prisma Client persistence, SQLite setup, API tests

apps/web
  React screens, API client, static fallback data, local visual assets

packages/domain
  Asset, investor, ledger, and purchase validation rules

contracts
  Reference allowlisted token contract for future testnet experiments

docs
  Product, compliance, roadmap, and API notes
```

## Current Runtime

The GitHub Pages version is frontend-only and uses static demo data from `packages/domain`.

The local full-stack version runs:

- `apps/api` on Fastify with SQLite persistence.
- `packages/domain` for shared purchase validation and portfolio math.
- `apps/web` with `VITE_API_URL` pointing at the API.

The API initializes its local SQLite tables through a checked-in schema helper and uses Prisma Client for all reads/writes. This avoids depending on migration tooling for the educational prototype while still keeping a Prisma schema beside the database model.

## Future Backend Boundary

A production-grade version would harden these API responsibilities:

- Asset issuance lifecycle.
- Investor identity and eligibility checks.
- Subscription orders and payment settlement.
- Transfer approvals and audit logging.
- Document storage and disclosure versioning.
- Portfolio reporting and tax exports.

The React app already has a typed API client. It falls back to seed data only when `VITE_API_URL` is not configured.

## Smart Contract Boundary

The contract in `contracts/` is a reference design only. It shows allowlisted transfers and owner-controlled minting, but it is not audited and is not compiled by the default CI gate.
