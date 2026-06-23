# Roadmap

## Phase 1: GitHub-Ready Prototype

- Simulated asset catalog.
- Simulated wallet and portfolio.
- Purchase validation rules.
- Local ownership ledger.
- Docs and CI.

## Phase 2: Full-Stack Demo

- Fastify API with persisted assets, investors, orders, holdings, and ledger entries.
- SQLite persistence through Prisma Client.
- API-backed purchase and admin asset flows.
- API tests in CI.

## Phase 3: Backend Hardening

- Admin authentication.
- Document uploads with version history.
- Immutable event log for compliance review.
- Role-based issuer, investor, and operator access.

## Phase 4: Blockchain Adapter

- Testnet deployment scripts.
- Contract event indexing.
- Wallet connection for signed purchase intents.
- Transfer restriction checks mirrored between API and contract.

## Phase 5: Production Research

- Legal structure by asset class and jurisdiction.
- KYC/AML vendor integration.
- Custody and transfer-agent requirements.
- Smart contract audit.
- Incident response, key management, and monitoring.
